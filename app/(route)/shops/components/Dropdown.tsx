import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useEffect, useRef } from "react";
import { useShops } from "../context/ShopsContext";
import { AxiosInstance } from "axios";
import type { ShopProps } from "@/types/shop";

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
    CREADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/xml/${id}`, axiosAuth, fetchInvoices),
    FIRMADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/sendsri/${id}`, axiosAuth, fetchInvoices),
    ENVIADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/authorize/${id}`, axiosAuth, fetchInvoices),
    RECIBIDA: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/authorize/${id}`, axiosAuth, fetchInvoices),
    EN_PROCESO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/authorize/${id}`, axiosAuth, fetchInvoices),
    DEVUELTA: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/xml/${id}`, axiosAuth, fetchInvoices),
    AUTORIZADO: (id, axiosAuth, fetchInvoices) =>
        handleApiCall(`retentions/cancel/${id}`, axiosAuth, fetchInvoices, "Para anular el comprobante en este sistema, primero debe anularlo en el SRI"),
    NO_AUTORIZADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`retentions/xml/${id}`, axiosAuth, fetchInvoices),
};

// 🔹 Diccionario de acciones asociadas al estado de la orden
const renderProcessLC: Record<string, (id: number, axiosAuth: AxiosInstance, fetchInvoices: () => void) => Promise<void>
> = {
    CREADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/xml`, axiosAuth, fetchInvoices),
    FIRMADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/sendsri`, axiosAuth, fetchInvoices),
    ENVIADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/authorize`, axiosAuth, fetchInvoices),
    RECIBIDA: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/authorize`, axiosAuth, fetchInvoices),
    EN_PROCESO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/authorize`, axiosAuth, fetchInvoices),
    DEVUELTA: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/xml`, axiosAuth, fetchInvoices),
    AUTORIZADO: (id, axiosAuth, fetchInvoices) =>
        handleApiCall(`shops/${id}/cancel`, axiosAuth, fetchInvoices, "Para anular el comprobante en este sistema, primero debe anularlo en el SRI"),
    NO_AUTORIZADO: (id, axiosAuth, fetchInvoices) => handleApiCall(`shops/${id}/xml`, axiosAuth, fetchInvoices),
};

export const Dropdown = ({ isOpen, index, shop, only, setIsOpen }: Props) => {

    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchShops } = useShops();

    // 🔹 Función para obtener las opciones del menú
    const getOptions = () => {
        const options = [
            { label: "Ver Pdf", onClick: () => viewPdf(`retentions/pdf/${shop.id}`) },
            { label: "Descargar Xml", onClick: () => downloadXml('retentions/download/' + shop.id, 'Retención') },
            { label: "Enviar correo", onClick: sendMail },
        ];

        if (shop.atts.state_retencion && shop.atts.state_retencion !== "ANULADO") {
            options.splice(1, 0, {
                label: renderSwitch[shop.atts.state_retencion.replace(' ', '_')],
                onClick: () => renderProcess[shop.atts.state_retencion](shop.id, axiosAuth, fetchShops),
            });
        }

        return options;
    };

    // 🔹 Función para obtener las opciones del menú liquidaciones en compra
    const getLCOptions = () => {
        const options = [
            { label: "Ver Pdf", onClick: () => viewPdf(`shops/${shop.id}/pdf`) },
            { label: "Descargar Xml", onClick: () => downloadXml(`shops/${shop.id}/download`, 'LC') },
        ];

        if (shop.atts.state && shop.atts.state !== "ANULADO") {
            options.splice(1, 0, {
                label: renderSwitch[shop.atts.state.replace(' ', '_')],
                onClick: () => renderProcessLC[shop.atts.state.replace(' ', '_')](shop.id, axiosAuth, fetchShops),
            });
        }

        return options;
    };

    const viewPdf = async (route: string) => {
        try {
            const response = await axiosAuth.get(route, { responseType: 'blob' });

            if (!response || !response.data) {
                throw new Error("Respuesta vacía al intentar obtener el PDF.");
            }

            const fileURL = createBlobUrl(response.data, 'application/pdf');

            if (fileURL) {
                window.open(fileURL, '_blank');
            } else {
                console.error("No se pudo generar la URL del archivo.");
            }

        } catch (error) {
            console.error("Error al descargar el PDF:", error);
        }
    };

    // 🔹 Función auxiliar para crear una URL a partir de un Blob
    const createBlobUrl = (data: BlobPart, type: string): string | null => {
        try {
            const file = new Blob([data], { type });
            return URL.createObjectURL(file);
        } catch (error) {
            console.error("Error al crear la URL del Blob:", error);
            return null;
        }
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

    const downloadXml = async (route: string, nameFile: string) => {
        try {
            const response = await axiosAuth.get(route);
            if (response.status >= 200) {
                const a = document.createElement('a') //Create <a>
                a.href = 'data:text/xml;base64,' + response.data.xml //Image Base64 Goes here
                a.download = `${nameFile} ${nameFile === 'LC' ? shop.atts.serie : shop.atts.serie_retencion}.xml` //File name Here
                a.click() //Downloaded file
            }
        } catch (error) {
            console.log(error)
        }
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
        </div>
    )
}
