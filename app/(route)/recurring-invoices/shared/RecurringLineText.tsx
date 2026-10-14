"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { useFormInvoice } from "../../orders/context/FormInvoiceContext";
import { SRI_MAX_LINE_CODE } from "@/constants";
import { filledLength, fillPlaceholders } from "@/helpers/recurrenceHelper";
import { ProductOutput } from "@/types";

interface Props {
    item: ProductOutput;
    // Fecha de la próxima emisión, para la vista previa
    previewDate?: string;
}

type Field = 'custom_code' | 'custom_description';

const input = "w-full rounded-md border px-2 py-1.5 text-sm bg-[var(--background)] text-ink-1 focus:outline-none focus:border-primary transition-colors";

// Código y descripción propios de la línea, armados con el mes (ej. AC{mm}{año} · Arriendo … {periodo})
export const RecurringLineText = ({ item, previewDate }: Props) => {

    const { setProductOutputs, errorProductOutputs, setErrorProductOutputs } = useFormInvoice();
    const error = errorProductOutputs[item.id];
    const hasCustom = !!(item.custom_code || item.custom_description);
    const [isOpen, setIsOpen] = useState(hasCustom || !!error?.custom_code || !!error?.custom_description);
    const open = isOpen || !!error?.custom_code || !!error?.custom_description;

    if (!item.product_id) return null;

    const update = (field: Field, value: string) => {
        setProductOutputs(prev => prev.map(line => (line.id === item.id ? { ...line, [field]: value } : line)));
        setErrorProductOutputs(prev => ({ ...prev, [item.id]: { ...prev[item.id], [field]: '' } }));
    };

    const code = item.custom_code?.trim() || item.product_code || '';
    const description = item.custom_description?.trim() || item.name || '';
    const preview = previewDate ? `${fillPlaceholders(code, previewDate)} · ${fillPlaceholders(description, previewDate)}` : null;
    const codeLength = item.custom_code ? filledLength(item.custom_code) : 0;

    return (
        <div className="mt-1.5">
            <button
                type="button"
                onClick={() => setIsOpen(!open)}
                aria-expanded={open}
                className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-brand-ink cursor-pointer"
            >
                <FaChevronDown aria-hidden="true" className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`} />
                {hasCustom ? 'Código y descripción propios' : 'Código y descripción para la factura'}
            </button>

            {open && (
                <div className="mt-1.5 flex flex-col gap-1.5 rounded-lg bg-surface-sunken p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-[9rem_minmax(0,1fr)] gap-1.5">
                        <label className="min-w-0">
                            <span className="sr-only">Código de la línea</span>
                            <input
                                value={item.custom_code ?? ''}
                                onChange={e => update('custom_code', e.target.value)}
                                maxLength={40}
                                placeholder={item.product_code || 'Código'}
                                aria-invalid={error?.custom_code ? 'true' : 'false'}
                                className={`${input} font-mono ${error?.custom_code ? 'border-red-400' : 'border-line-strong'}`}
                            />
                        </label>
                        <label className="min-w-0">
                            <span className="sr-only">Descripción de la línea</span>
                            <input
                                value={item.custom_description ?? ''}
                                onChange={e => update('custom_description', e.target.value)}
                                maxLength={300}
                                placeholder={item.name || 'Descripción'}
                                aria-invalid={error?.custom_description ? 'true' : 'false'}
                                className={`${input} ${error?.custom_description ? 'border-red-400' : 'border-line-strong'}`}
                            />
                        </label>
                    </div>
                    {(error?.custom_code || error?.custom_description) && (
                        <p className="text-xs text-red-500">{error.custom_code || error.custom_description}</p>
                    )}
                    <p className="text-xs text-ink-3">
                        Vacío usa el del producto. Usa {'{mm}'} {'{año}'} {'{mes}'} {'{periodo}'}: ej. <span className="font-mono">AC{'{mm}'}{'{año}'}</span>.
                        {codeLength > 0 && <span className={`ml-1 tabular-nums ${codeLength > SRI_MAX_LINE_CODE ? 'text-sri-fail' : ''}`}>Código: {codeLength}/{SRI_MAX_LINE_CODE}</span>}
                    </p>
                    {preview && hasCustom && (
                        <p className="text-xs text-ink-2">
                            <span className="text-ink-3">Próxima: </span>
                            <span className="break-words">{preview}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
