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
            "post",
        );
    }
    return handleApiCall(`${basePath}/${id}/process`, axiosAuth, fetchInvoices);
};

export const Dropdown = ({ isOpen, index, shop, only, setIsOpen }: Props) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente
    const { fetchShops } = useShops();
    const [pdf, setPdf] = useState<{ route: string; name: string } | null>(null);

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

        if (shop.atts.state_retencion && shop.atts.state_retencion !== "ANULADO") {
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

        if (shop.atts.state && shop.atts.state !== "ANULADO") {
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
            const response = await axiosAuth.get(`retentions/mail/${shop.id}`);
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
                onClick={() => setIsOpen(index)}
                className="rounded-full text-white bg-blue-700 px-3 py-1 m-auto font-bold cursor-pointer"
            >
                &#60;
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute origin-top-right right-9 z-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700
                ${only ? "-mt-24" : "-mt-4"}`}
                >
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
    );
};
