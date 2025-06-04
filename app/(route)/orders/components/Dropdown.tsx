import { downloadXml } from "@/services/downloadXmlServices";
import { useInvoices } from "../context/InvoicesContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ⚠️ Verifica que el path sea correcto
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { OrderProps } from "@/types/order";
import { PDFViewer } from "@/components";
import { AxiosInstance } from "axios";

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
    alertMessage?: string
): Promise<void> => {
    try {
        const response = await axiosAuth.get(`orders/${endpoint}/${id}`);
        if (response.status >= 200) {
            fetchInvoices();
        } else if (alertMessage) {
            alert(alertMessage);
        }
    } catch (error) {
        console.error(error);
    }
};

// 🔹 Diccionario de acciones asociadas al estado de la orden
const renderProcess: Record<string, (id: number, axiosAuth: AxiosInstance, fetchInvoices: () => void) => Promise<void>
> = {
    CREADO: (id, axiosAuth, fetchInvoices) => handleApiCall("xml", id, axiosAuth, fetchInvoices),
    FIRMADO: (id, axiosAuth, fetchInvoices) => handleApiCall("sendsri", id, axiosAuth, fetchInvoices),
    ENVIADO: (id, axiosAuth, fetchInvoices) => handleApiCall("authorize", id, axiosAuth, fetchInvoices),
    RECIBIDA: (id, axiosAuth, fetchInvoices) => handleApiCall("authorize", id, axiosAuth, fetchInvoices),
    EN_PROCESO: (id, axiosAuth, fetchInvoices) => handleApiCall("authorize", id, axiosAuth, fetchInvoices),
    DEVUELTA: (id, axiosAuth, fetchInvoices) => handleApiCall("xml", id, axiosAuth, fetchInvoices),
    AUTORIZADO: (id, axiosAuth, fetchInvoices) =>
        handleApiCall("cancel", id, axiosAuth, fetchInvoices, "Para anular el comprobante en este sistema, primero debe anularlo en el SRI"),
    NO_AUTORIZADO: (id, axiosAuth, fetchInvoices) => handleApiCall("xml", id, axiosAuth, fetchInvoices),
};

export const Dropdown = ({ isOpen, index, order, only, setIsOpen }: Props) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchInvoices } = useInvoices();
    const { data: session } = useSession();
    const [pdf, setPdf] = useState<{ route: string, name: string } | null>(null);

    // 🔹 Función para obtener las opciones del menú
    const getOptions = () => {
        const options = [
            { label: "Ver Pdf", onClick: showOrderPdf },
            { label: "Descargar Xml", onClick: () => downloadXml(`orders/download/${order.id}`, axiosAuth, `${order.atts.voucher_type == 1 ? 'Factura' : 'NC'} ${order.atts.serie}`) },
            { label: "Enviar correo", onClick: sendMail },
        ];

        if (session?.user.permissions.printf) {
            options.push({ label: "Imprimir", onClick: printfPdf });
        }

        if (order.atts.state !== "ANULADO") {
            options.splice(1, 0, {
                label: renderSwitch[order.atts.state.replace(' ', '_')],
                onClick: () => renderProcess[order.atts.state](order.id, axiosAuth, fetchInvoices),
            });
        }

        return options;
    };

    const showOrderPdf = async () => {
        setPdf({ route: `orders/${order.id}/pdf`, name: `${order.atts.voucher_type == 1 ? 'Factura' : 'NC'} ${order.atts.serie}` })
    };

    const sendMail = async () => {
        if (order.atts.state !== 'AUTORIZADO') {
            alert('La factura debe estar AUTORIZADO para enviar')
            return
        }
        if (order.customer.email === null) {
            alert('Agregue el CORREO ELECTRÓNICO del cliente para enviar')
            return
        }
        try {
            const response = await axiosAuth.get(`orders/${order.id}/mail`);
            if (response.status >= 200) {
                fetchInvoices();
            }
        } catch (error) {
            console.log(error)
        }
    };

    const printfPdf = async () => {
        setPdf({ route: `orders/${order.id}/printf`, name: `Impresión ${order.atts.serie}` })
    }

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
                <button onClick={() => setIsOpen(index)} className="rounded-full text-white bg-blue-700 px-3 py-1 m-auto font-bold cursor-pointer">&#60;</button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className={`absolute origin-top-right right-9 z-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700 
                ${only ? '-mt-20' : '-mt-4'}`}>
                        <div className="py-1">
                            {getOptions().map((option, indexOption) => (
                                <button
                                    key={indexOption}
                                    onClick={() => {
                                        setIsOpen(index); // Close dropdown after selection
                                        option.onClick();
                                    }}
                                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white text-left"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {pdf && <PDFViewer pdf={pdf} />}
        </>
    );
};