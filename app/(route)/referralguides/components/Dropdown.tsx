import { useReferralGuides } from "../context/ReferralGuidesContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ⚠️ Verifica que el path sea correcto
import { ReferralGuideProps } from "@/types";
import { useEffect, useRef } from "react";
import { AxiosInstance } from "axios";

interface Props {
    isOpen: boolean;
    index: number;
    referralGuide: ReferralGuideProps;
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
    id: number,
    axiosAuth: AxiosInstance,
    fetchReferralGuides: () => void,
    alertMessage?: string
): Promise<void> => {
    try {
        const response = await axiosAuth.get(`referralguides/${endpoint}/${id}`);
        if (response.status >= 200) {
            fetchReferralGuides();
        } else if (alertMessage) {
            alert(alertMessage);
        }
    } catch (error) {
        console.error(error);
    }
};

// 🔹 Diccionario de acciones asociadas al estado de la orden
const renderProcess: Record<string, (id: number, axiosAuth: AxiosInstance, fetchReferralGuides: () => void) => Promise<void>
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

export const Dropdown = ({ isOpen, index, referralGuide, only, setIsOpen }: Props) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchReferralGuides } = useReferralGuides();

    // 🔹 Función para obtener las opciones del menú
    const getOptions = () => {
        const options = [
            { label: "Ver Pdf", onClick: viewReferralGuidePdf },
            { label: "Descargar Xml", onClick: downloadXml },
            { label: "Enviar correo", onClick: sendMail },
        ];

        if (referralGuide.atts.state !== "ANULADO") {
            options.splice(1, 0, {
                label: renderSwitch[referralGuide.atts.state.replace(' ', '_')],
                onClick: () => renderProcess[referralGuide.atts.state](parseInt(referralGuide.id), axiosAuth, fetchReferralGuides),
            });
        }

        return options;
    };

    const viewReferralGuidePdf = async () => {
        try {
            const response = await axiosAuth.get(`referralguides/${referralGuide.id}/pdf`, { responseType: 'blob' });

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
        if (referralGuide.atts.state !== 'AUTORIZADO') {
            alert('La factura debe estar AUTORIZADO para enviar')
            return
        }
        // if (referralGuide.customer.email === null) {
        //     alert('Agregue el CORREO ELECTRÓNICO del cliente para enviar')
        //     return
        // }
        try {
            const response = await axiosAuth.get(`referralguides/${referralGuide.id}/mail`);
            if (response.status >= 200) {
                fetchReferralGuides();
            }
        } catch (error) {
            console.log(error)
        }
    };

    const downloadXml = async () => {
        try {
            const response = await axiosAuth.get('referralGuides/download/' + referralGuide.id);
            if (response.status >= 200) {
                const a = document.createElement('a') //Create <a>
                a.href = 'data:text/xml;base64,' + response.data.xml //Image Base64 Goes here
                a.download = 'Factura.xml' //File name Here
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
                <div className={`absolute origin-top-right right-9 z-1 w-40 bg-white breferralGuide breferralGuide-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:breferralGuide-gray-700 
                ${only ? '-mt-24' : '-mt-4'}`}>
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
    );
};