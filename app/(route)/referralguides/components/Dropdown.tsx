import { FaEllipsisVertical } from "react-icons/fa6";
import { useReferralGuides } from "../context/ReferralGuidesContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ⚠️ Verifica que el path sea correcto
import { ReferralGuideProps } from "@/types";
import { useEffect, useRef, useState } from "react";
import { AxiosInstance } from "axios";
import { PDFViewer } from "@/components";
import { usePlan } from "@/lib/hooks/usePlan";

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
        const response = await axiosAuth.get(`referralguides/${id}/${endpoint}`);
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
    CREADO: (id, axiosAuth, fetchInvoices) => handleApiCall("process", id, axiosAuth, fetchInvoices),
    // El backend nuevo solo expone /process (firma, envía y autoriza según el estado)
    FIRMADO: (id, axiosAuth, fetchInvoices) => handleApiCall("process", id, axiosAuth, fetchInvoices),
    ENVIADO: (id, axiosAuth, fetchInvoices) => handleApiCall("process", id, axiosAuth, fetchInvoices),
    RECIBIDA: (id, axiosAuth, fetchInvoices) => handleApiCall("process", id, axiosAuth, fetchInvoices),
    EN_PROCESO: (id, axiosAuth, fetchInvoices) => handleApiCall("process", id, axiosAuth, fetchInvoices),
    DEVUELTA: (id, axiosAuth, fetchInvoices) => handleApiCall("process", id, axiosAuth, fetchInvoices),
    NO_AUTORIZADO: (id, axiosAuth, fetchInvoices) => handleApiCall("process", id, axiosAuth, fetchInvoices),
};

export const Dropdown = ({ isOpen, index, referralGuide, only, setIsOpen }: Props) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchReferralGuides } = useReferralGuides();
    const [pdf, setPdf] = useState<{ route: string, name: string } | null>(null);
    const { canEmit } = usePlan();

    // 🔹 Función para obtener las opciones del menú
    const getOptions = () => {
        const options = [
            { label: "Ver Pdf", onClick: () => setPdf({ route: `referralguides/${referralGuide.id}/pdf`, name: `Guia ${referralGuide.atts.serie}` }) },
            { label: "Enviar correo", onClick: sendMail },
        ];

        // Procesar solo mientras no esté autorizada (la guía no se anula); con plan vencido no se procesa
        const state = referralGuide.atts.state.replace(' ', '_');
        if (canEmit && renderSwitch[state]) {
            options.splice(1, 0, {
                label: renderSwitch[state],
                onClick: () => renderProcess[state](parseInt(referralGuide.id), axiosAuth, fetchReferralGuides),
            });
        }

        return options;
    };

    const sendMail = async () => {
        if (referralGuide.atts.state !== 'AUTORIZADO') {
            alert('La factura debe estar AUTORIZADO para enviar')
            return
        }
        try {
            const response = await axiosAuth.get(`referralguides/${referralGuide.id}/mail`);
            if (response.status >= 200) {
                fetchReferralGuides();
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
                <div className={`absolute origin-top-right right-9 z-1 w-40 bg-surface border border-line rounded-lg shadow-lg
                ${only ? '-mt-24' : '-mt-4'}`}>
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
            {pdf && <PDFViewer pdf={pdf} />}
        </div>
    );
};