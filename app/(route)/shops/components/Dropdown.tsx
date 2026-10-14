import { FaEllipsisVertical } from "react-icons/fa6";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useEffect, useRef, useState } from "react";
import { useShops } from "../context/ShopsContext";
import { AxiosInstance } from "axios";
import type { ShopProps } from "@/types/shop";
import { PDFViewer } from "@/components";
import { downloadXml } from "@/services/downloadXmlServices";
import { SHOP_SERIE_PREFIX } from "@/constants";
import { RegisterPaymentModal } from "../shared/RegisterPaymentModal";
import { usePlan } from "@/lib/hooks/usePlan";

interface Props {
    isOpen: boolean;
    index: number;
    shop: ShopProps;
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
    "PENDIENTE_DE_ANULAR": "Anular",
};

// 🔹 Función genérica para llamadas a la API
const handleApiCall = async (
    endpoint: string,
    axiosAuth: AxiosInstance,
    fetchInvoices: () => void,
    alertMessage?: string,
    method: "get" | "post" = "get",
): Promise<void> => {
    try {
        const response = await axiosAuth[method](endpoint);
        if (response.status >= 200) {
            fetchInvoices();
        } else if (alertMessage) {
            alert(alertMessage);
        }
    } catch (error) {
        console.error(error);
    }
};

// 🔹 Acción de proceso/anulación según estado
const processAction = (
    basePath: string,
    state: string,
    id: number,
    axiosAuth: AxiosInstance,
    fetchInvoices: () => void,
): Promise<void> => {
    if (state === "AUTORIZADO" || state === "PENDIENTE_DE_ANULAR") {
        return handleApiCall(
            `${basePath}/${id}/cancel`,
            axiosAuth,
            fetchInvoices,
            "Para anular el comprobante en este sistema, primero debe anularlo en el SRI",
        );
    }
    return handleApiCall(`${basePath}/${id}/process`, axiosAuth, fetchInvoices);
};

export const Dropdown = ({ isOpen, index, shop, only, setIsOpen }: Props) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchShops } = useShops();
    const [pdf, setPdf] = useState<{ route: string; name: string } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const { canEmit } = usePlan();
    // Con plan vencido no se procesa/envía al SRI; anular sí se permite
    const canProcess = (state: string) => canEmit || state === "AUTORIZADO" || state === "PENDIENTE_DE_ANULAR";

    // La lista (GET shops) no manda voucher_type confiable por fila; se lee del
    // prefijo que el backend ya arma en `serie` (ej. "L/C 001-010-000000005").
    const seriePrefix = shop.atts.serie?.trim().split(" ")[0] ?? "";
    const isLiquidacion = seriePrefix === SHOP_SERIE_PREFIX.LIQUIDACION_COMPRA;
    // Abonos sobre cartera existente: permitidos con cualquier plan (incluso vencido)
    const canRegisterPayment = shop.atts.payment_type === "CREDITO" && Number(shop.atts.paid) < Number(shop.atts.total);

    // 🔹 Función para obtener las opciones del menú
    const getOptions = () => {
        const options = [
            {
                label: "Ver Pdf",
                onClick: () =>
                    setPdf({ route: `retentions/${shop.id}/pdf`, name: `Retención ${shop.atts.serie_retencion}` }),
            },
            { label: "Enviar correo", onClick: sendMail },
            {
                label: "Descargar Xml",
                onClick: () =>
                    downloadXml(`retentions/${shop.id}/xml`, axiosAuth, `Retención ${shop.atts.serie_retencion}`),
            },
        ];

        if (shop.atts.state_retencion && shop.atts.state_retencion !== "ANULADO" && canProcess(shop.atts.state_retencion.replace(/ /g, "_"))) {
            const state = shop.atts.state_retencion.replace(/ /g, "_");
            options.splice(1, 0, {
                label: renderSwitch[state],
                onClick: () => processAction("retentions", state, shop.id, axiosAuth, fetchShops),
            });
        }

        return options;
    };

    // 🔹 Función para obtener las opciones del menú liquidaciones en compra
    const getLCOptions = () => {
        const options = [
            {
                label: "Ver Pdf",
                onClick: () =>
                    setPdf({ route: `shops/${shop.id}/pdf`, name: `Liquidación en compra ${shop.atts.serie}` }),
            },
            {
                label: "Descargar Xml",
                onClick: () => downloadXml(`shops/${shop.id}/download`, axiosAuth, `LC ${shop.atts.serie}`),
            },
        ];

        if (shop.atts.state && shop.atts.state !== "ANULADO" && canProcess(shop.atts.state.replace(" ", "_"))) {
            options.splice(1, 0, {
                label: renderSwitch[shop.atts.state.replace(" ", "_")],
                onClick: () => processAction("shops", shop.atts.state.replace(" ", "_"), shop.id, axiosAuth, fetchShops),
            });
        }

        return options;
    };

    const sendMail = async () => {
        if (shop.atts.state_retencion !== "AUTORIZADO") {
            alert("La retención debe estar AUTORIZADO para enviar");
            return;
        }
        if (shop.provider.email === null) {
            alert("Agregue el CORREO ELECTRÓNICO del provedor para enviar");
            return;
        }
        try {
            const response = await axiosAuth.get(`retentions/${shop.id}/mail`);
            if (response.status >= 200) {
                fetchShops();
            }
        } catch (error) {
            console.log(error);
        }
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
                ${only ? "-mt-24" : "-mt-4"}`}
                >
                    <div className="py-1">
                        {canRegisterPayment && (
                            <>
                                <button
                                    onClick={() => {
                                        setIsOpen(index); // Close dropdown after selection
                                        setIsPaymentModalOpen(true);
                                    }}
                                    className="block w-full px-4 py-2 text-sm text-ink-2 hover:bg-surface-sunken hover:text-ink-1 text-left cursor-pointer"
                                >
                                    Registrar pago
                                </button>
                                <div className="my-1 border-t border-[var(--border)]" />
                            </>
                        )}
                        {shop.atts.state_retencion && (
                            <>
                                <span className="py-1">Retención</span>
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
                            </>
                        )}
                        {shop.atts.state_retencion && isLiquidacion && (
                            <div className="my-1 border-t border-[var(--border)]" />
                        )}
                        {isLiquidacion && (
                            <>
                                <span className="p-1 font-bold">Liquidación en compra</span>
                                {getLCOptions().map((option, indexOption) => (
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
                            </>
                        )}
                    </div>
                </div>
            )}
            {pdf && <PDFViewer pdf={pdf} />}
            {isPaymentModalOpen && (
                <RegisterPaymentModal
                    shopId={shop.id}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSaved={() => {
                        setIsPaymentModalOpen(false);
                        fetchShops();
                    }}
                />
            )}
        </div>
    );
};
