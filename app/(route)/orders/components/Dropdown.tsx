import { FaEllipsisVertical } from "react-icons/fa6";
import { downloadXml } from "@/services/downloadXmlServices";
import { canShareFiles, sharePdf } from "@/services/sharePdfService";
import { useInvoices } from "../context/InvoicesContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ⚠️ Verifica que el path sea correcto
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { OrderProps } from "@/types/order";
import { PDFViewer } from "@/components";
import { AxiosError, AxiosInstance } from "axios";
import { LaravelErrorResponse } from "@/types";
import { useToast } from "@/context/ToastContext";
import { ORDER_SERIE_PREFIX } from "@/constants";
import { RegisterPaymentModal } from "../shared/RegisterPaymentModal";
import { usePlan } from "@/lib/hooks/usePlan";
import { useRouter } from "next/navigation";

interface Props {
    isOpen: boolean;
    index: number;
    order: OrderProps;
    only?: boolean;
    setIsOpen: (index: number | null) => void;
}

const renderSwitch: Record<string, string> = {
    CREADO: "Procesar",
    FIRMADO: "Enviar y procesar",
    ENVIADO: "Autorizar",
    RECIBIDA: "Autorizar",
    EN_PROCESO: "Autorizar",
    DEVUELTA: "Volver a procesar",
    AUTORIZADO: "Anular",
    NO_AUTORIZADO: "Volver a procesar",
};

// 🔹 Función genérica para llamadas a la API
const handleApiCall = async (
    endpoint: string,
    id: number,
    axiosAuth: AxiosInstance,
    fetchInvoices: () => void,
    alertMessage?: string,
    onError?: (message: string) => void,
): Promise<void> => {
    try {
        const response = await axiosAuth.get(`orders/${id}/${endpoint}`);
        if (response.status >= 200) {
            fetchInvoices();
        } else if (alertMessage) {
            alert(alertMessage);
        }
    } catch (error) {
        console.error(error);
        // Ej. convertir proforma con inventario y sin stock: 422 con errors.products
        const data = (error as AxiosError<LaravelErrorResponse>).response?.data;
        const message = data?.errors?.products?.[0] ?? data?.message;
        if (onError && message) onError(message);
    }
};

export const Dropdown = ({ isOpen, index, order, only, setIsOpen }: Props) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchInvoices } = useInvoices();
    const { data: session } = useSession();
    const [pdf, setPdf] = useState<{ route: string; name: string } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const { canEmit } = usePlan();
    const router = useRouter();
    const { toast } = useToast();

    // La lista (GET orders) no manda voucher_type por fila; el tipo se lee del
    // prefijo que el backend ya arma en `serie` (ej. "FAC 001-001-000000001").
    // Factura y Nota de Crédito son comprobantes electrónicos (van al SRI):
    // solo esos llevan Procesar/Descargar Xml. Nota de Venta y Proforma no.
    const seriePrefix = order.atts.serie?.trim().split(" ")[0] ?? "";
    const isElectronicVoucher = seriePrefix === ORDER_SERIE_PREFIX.FACTURA || seriePrefix === ORDER_SERIE_PREFIX.NOTA_CREDITO;
    const isProforma = seriePrefix === ORDER_SERIE_PREFIX.PROFORMA;

    // 🔹 Función para obtener las opciones del menú
    const getOptions = () => {
        const options = [{ label: "Ver Pdf", onClick: showOrderPdf }];

        // Con plan vencido no se procesa/envía al SRI; anular sí se permite
        const canProcess = canEmit || order.atts.state === "AUTORIZADO";
        if (isElectronicVoucher && order.atts.state !== "ANULADO" && canProcess) {
            options.push({
                label: renderSwitch[order.atts.state.replace(" ", "_")],
                onClick: async () => {
                    const state = order.atts.state.replace(" ", "_");
                    const isCancel = state === "AUTORIZADO";
                    await handleApiCall(
                        isCancel ? "cancel" : "process",
                        order.id,
                        axiosAuth,
                        fetchInvoices,
                        isCancel ? "Para anular el comprobante en este sistema, primero debe anularlo en el SRI" : undefined,
                    );
                },
            });
        }

        if (session?.user.permissions.printf) {
            options.push({ label: "Imprimir", onClick: printfPdf });
        }
        options.push({ label: "Enviar correo", onClick: sendMail });

        if (isProforma && canEmit) {
            options.push({
                label: "Convertir en Factura",
                onClick: () => handleApiCall("convert-to-invoice", order.id, axiosAuth, fetchInvoices, undefined, (message) => toast(message, 'error')),
            });
        }

        if (canShareFiles()) {
            options.push({
                label: "Compartir",
                onClick: () =>
                    sharePdf(`orders/${order.id}/pdf`, axiosAuth, order.atts.serie),
            });
        }

        // Al final: Registrar pago, Hacer recurrente y Descargar Xml (último)
        // Abonos sobre cartera existente: permitidos con cualquier plan (incluso vencido)
        if (order.atts.payment_type === "CREDITO" && Number(order.atts.paid) < order.atts.total) {
            options.push({ label: "Registrar pago", onClick: async () => setIsPaymentModalOpen(true) });
        }

        // Plantilla que se emite sola cada período, precargada con esta factura
        if (seriePrefix === ORDER_SERIE_PREFIX.FACTURA && canEmit) {
            options.push({
                label: "Hacer recurrente",
                onClick: async () => router.push(`/recurring-invoices/create?from_order=${order.id}`),
            });
        }

        if (isElectronicVoucher) {
            options.push({
                label: "Descargar Xml",
                onClick: () =>
                    downloadXml(`orders/${order.id}/xml`, axiosAuth, order.atts.serie),
            });
        }

        return options;
    };

    const showOrderPdf = async () => {
        setPdf({
            route: `orders/${order.id}/pdf`,
            name: order.atts.serie,
        });
    };

    const sendMail = async () => {
        if (order.atts.state !== "AUTORIZADO") {
            alert("La factura debe estar AUTORIZADO para enviar");
            return;
        }
        if (order.customer.email === null) {
            alert("Agregue el CORREO ELECTRÓNICO del cliente para enviar");
            return;
        }
        try {
            const response = await axiosAuth.get(`orders/${order.id}/mail`);
            if (response.status >= 200) {
                fetchInvoices();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const printfPdf = async () => {
        setPdf({ route: `orders/${order.id}/printf`, name: `Impresión ${order.atts.serie}` });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(null);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    return (
        <>
            <div ref={dropdownRef} className="relative inline-block min-w-[40px]">
                {/* Dropdown Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(index)}
                    aria-label="Acciones"
                    aria-expanded={isOpen}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-3 transition-colors cursor-pointer hover:bg-surface-sunken hover:text-ink-1 focus-visible:outline-2 focus-visible:outline-brand-ink ${isOpen ? 'bg-surface-sunken text-ink-1' : ''}`}
                >
                    <FaEllipsisVertical aria-hidden="true" />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div
                        className={`absolute origin-top-right right-9 z-1 w-40 bg-surface border border-line rounded-lg shadow-lg
                ${only ? "-mt-20" : "-mt-4"}`}
                    >
                        <div className="py-1">
                            {getOptions().map((option, indexOption) => (
                                <button
                                    key={indexOption}
                                    onClick={() => {
                                        setIsOpen(index); // Close dropdown after selection
                                        option.onClick();
                                    }}
                                    className="block w-full px-4 py-2 text-sm text-ink-2 hover:bg-surface-sunken hover:text-ink-1 text-left cursor-pointer"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {pdf && <PDFViewer pdf={pdf} />}
            {isPaymentModalOpen && (
                <RegisterPaymentModal
                    orderId={order.id}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSaved={() => {
                        setIsPaymentModalOpen(false);
                        fetchInvoices();
                    }}
                />
            )}
        </>
    );
};
