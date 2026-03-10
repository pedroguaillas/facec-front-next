import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useEffect, useRef, useState } from "react";
import { useShops } from "../context/ShopsContext";
import { AxiosInstance } from "axios";
import type { ShopProps } from "@/types/shop";
import { PDFViewer } from "@/components";
import { downloadXml } from "@/services/downloadXmlServices";

interface Props {
    isOpen: boolean;
    index: number;
    shop: ShopProps;
    only?: boolean;
    setIsOpen: (index: number | null) => void;
}
const renderSwitch: Record<string, string> = {
    CREADO: "Firmar, enviar y procesar",
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
    axiosAuth: AxiosInstance,
    fetchInvoices: () => void,
    alertMessage?: string
): Promise<void> => {
    try {
        const response = await axiosAuth.get(endpoint);
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
    CREADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/${id}/process`, axiosAuth, fetchInvoices),
    FIRMADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/${id}/sendsri`, axiosAuth, fetchInvoices),
    ENVIADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/${id}/authorize`, axiosAuth, fetchInvoices),
    RECIBIDA: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/${id}/authorize`, axiosAuth, fetchInvoices),
    EN_PROCESO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/${id}/authorize`, axiosAuth, fetchInvoices),
    DEVUELTA: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/${id}/process`, axiosAuth, fetchInvoices),
    AUTORIZADO: (id, axiosAuth, fetchInvoices) =>
        handleApiCall(`retentions/cancel/${id}`, axiosAuth, fetchInvoices, "Para anular el comprobante en este sistema, primero debe anularlo en el SRI"),
    NO_AUTORIZADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/${id}/process`, axiosAuth, fetchInvoices),
};

// 🔹 Diccionario de acciones asociadas al estado de la orden
const renderProcessLC: Record<string, (id: number, axiosAuth: AxiosInstance, fetchInvoices: () => void) => Promise<void>
> = {
    CREADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/process`, axiosAuth, fetchInvoices),
    FIRMADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/sendsri`, axiosAuth, fetchInvoices),
    ENVIADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/authorize`, axiosAuth, fetchInvoices),
    RECIBIDA: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/authorize`, axiosAuth, fetchInvoices),
    EN_PROCESO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/authorize`, axiosAuth, fetchInvoices),
    DEVUELTA: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/process`, axiosAuth, fetchInvoices),
    AUTORIZADO: (id, axiosAuth, fetchInvoices) =>
        handleApiCall(`shops/${id}/cancel`, axiosAuth, fetchInvoices, "Para anular el comprobante en este sistema, primero debe anularlo en el SRI"),
    NO_AUTORIZADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/process`, axiosAuth, fetchInvoices),
};

export const Dropdown = ({ isOpen, index, shop, only, setIsOpen }: Props) => {

    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchShops } = useShops();
    const [pdf, setPdf] = useState<{ route: string, name: string } | null>(null);

    // 🔹 Función para obtener las opciones del menú
    const getOptions = () => {
        const options = [
            { label: "Ver Pdf", onClick: () => setPdf({ route: `retentions/${shop.id}/pdf`, name: `Retención ${shop.atts.serie_retencion}` }) },
            { label: "Descargar Xml", onClick: () => downloadXml(`retentions/${shop.id}/xml`, axiosAuth, `Retención ${shop.atts.serie_retencion}`) },
            { label: "Enviar correo", onClick: sendMail },
        ];

        if (shop.atts.state_retencion && shop.atts.state_retencion !== "ANULADO") {
            options.splice(1, 0, {
                label: renderSwitch[shop.atts.state_retencion.replace(' ', '_')],
                onClick: () => renderProcess[shop.atts.state_retencion.replace(' ', '_')](shop.id, axiosAuth, fetchShops),
            });
        }

        return options;
    };

    // 🔹 Función para obtener las opciones del menú liquidaciones en compra
    const getLCOptions = () => {
        const options = [
            { label: "Ver Pdf", onClick: () => setPdf({ route: `shops/${shop.id}/pdf`, name: `Liquidación en compra ${shop.atts.serie}` }) },
            { label: "Descargar Xml", onClick: () => downloadXml(`shops/${shop.id}/download`, axiosAuth, `LC ${shop.atts.serie}`) },
        ];

        if (shop.atts.state && shop.atts.state !== "ANULADO") {
            options.splice(1, 0, {
                label: renderSwitch[shop.atts.state.replace(' ', '_')],
                onClick: () => renderProcessLC[shop.atts.state.replace(' ', '_')](shop.id, axiosAuth, fetchShops),
            });
        }

        return options;
    };

    const sendMail = async () => {
        if (shop.atts.state_retencion !== 'AUTORIZADO') {
            alert('La retención debe estar AUTORIZADO para enviar')
            return
        }
        if (shop.provider.email === null) {
            alert('Agregue el CORREO ELECTRÓNICO del provedor para enviar')
            return
        }
        try {
            const response = await axiosAuth.get(`retentions/mail/${shop.id}`);
            if (response.status >= 200) {
                fetchShops();
            }
        } catch (error) {
            console.log(error)
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
            <button onClick={() => setIsOpen(index)} className="rounded-full text-white bg-blue-700 px-3 py-1 m-auto font-bold cursor-pointer">&#60;</button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`absolute origin-top-right right-9 z-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700 
                ${only ? '-mt-24' : '-mt-4'}`}>
                    <div className="py-1">
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
                                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white text-left"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </>
                        )}
                        {shop.atts.voucher_type === 3 && (
                            <>
                                <span className="p-1 font-bold">Liquidación en compra</span>
                                {getLCOptions().map((option, indexOption) => (
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
                            </>
                        )}
                    </div>
                </div>
            )}
            {pdf && <PDFViewer pdf={pdf} />}
        </div>
    )
}
