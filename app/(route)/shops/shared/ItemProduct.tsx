import { IconButton, PresentationLabel, SelectProduct } from "@/components";
import { fields, ProductOutput, ProductPresentation, ProductProps } from "@/types";
import { limitDecimals } from "@/helpers/numberHelper";
import { useInventory } from "@/lib/hooks/useInventory";
import { DragHandle, useSortableItem } from "../../orders/shared/SortableItems";
import { cellInput, cellInputError, cellInputNormal, tableRow } from "../../orders/shared/FormSection";
import { useProductTemplates } from "@/lib/hooks/useProductTemplates";
import { templateFieldsOf, unitCodeOf } from "@/helpers/productTemplateHelper";
import { isUnitLine } from "../hooks/useListProducts";
import { useState } from "react";

interface ItemProductProps {
    index: number;
    productOutput: ProductOutput;
    updateItem: (index: number, field: fields, value: string | number) => void;
    selectProduct: (index: number, product: ProductProps, search?: string, presentation?: ProductPresentation | null) => void;
    deleteItem: (index: number) => void;
    sortable?: boolean;
    // Solo productos (los servicios no llevan inventario)
    onlyProducts?: boolean;
    // Unidad nueva de un modelo (ej. moto): key null = código manual
    updateUnit: (index: number, key: string | null, value: string) => void;
    addUnitLine: (index: number) => void;
    // Errores 422 de la línea: products.N.unit.chasis, products.N.unit_code, ...
    errors?: Record<string, string>;
    toggleRemember: (index: number) => void;
}

const inputBase = `${cellInput} ${cellInputNormal} text-right`;
// En celular la fila se apila: producto arriba a lo ancho; cantidad, costo y subtotal debajo
const mobileRow = "max-md:grid max-md:grid-cols-[2rem_repeat(3,minmax(0,1fr))_2.75rem] max-md:items-end";

export const ItemProduct = ({ index, productOutput, updateItem, selectProduct, deleteItem, sortable = false, onlyProducts = false, updateUnit, addUnitLine, errors = {}, toggleRemember }: ItemProductProps) => {
    const { setNodeRef, style, isDragging, handleProps } = useSortableItem(productOutput.id);
    // Presentaciones solo con inventario activo
    const { enabled: inventory } = useInventory();
    const templates = useProductTemplates();
    const template = templates.find(t => t.id === productOutput.unit_template_id);
    const unitFields = templateFieldsOf(template, 'unidad');
    const unitLine = isUnitLine(productOutput);
    const prefix = `products.${index}`;
    // Errores de la línea que no van en un input de la unidad
    const lineError = [errors[`${prefix}.unit`], errors[`${prefix}.quantity`], errors[`${prefix}.product_id`], errors[`${prefix}.presentation_id`]].filter(Boolean).join(' · ');
    const codePreview = unitCodeOf(template, productOutput.unit ?? {});
    // Línea del XML: cantidad y costo fijos; el producto se vincula (también servicios)
    const xml = productOutput.xml;
    const existingUnit = productOutput.parent_product_id
        ? [...(productOutput.characteristics ?? [])].sort((a, b) => a.sort - b.sort).filter(c => c.value).map(c => `${c.label} ${c.value}`).join(' · ')
        : '';

    return (
        <tr ref={setNodeRef} style={style} className={`${tableRow} ${mobileRow} ${isDragging ? 'bg-surface shadow-md' : ''}`}>
            <td className="py-0.5! align-middle max-md:self-start max-md:pt-2!">
                {sortable && <DragHandle {...handleProps} label={`Mover línea ${index + 1}`} />}
            </td>
            <td className="max-md:col-span-4 min-w-0">
                <SelectProduct index={index} label={productOutput.product_id ? productOutput.name : ''} selectProduct={selectProduct} onlyProducts={onlyProducts && !xml} withPresentations={inventory} />
                {xml && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        {!productOutput.product_id && <span className="rounded-full bg-sri-wait-soft px-2 py-0.5 font-medium text-sri-wait">Por vincular</span>}
                        <span className="text-ink-3 min-w-0">XML: {xml.code ? `${xml.code} · ` : ''}{xml.description}</span>
                        {xml.match === 'manual' && (
                            <label className="inline-flex items-center gap-1 text-ink-2 cursor-pointer">
                                <input type="checkbox" checked={!!xml.remember} onChange={() => toggleRemember(index)} className="size-3.5 accent-primary" />
                                Recordar para este proveedor
                            </label>
                        )}
                    </div>
                )}
                {xml && <XmlAdditional additional={xml.additional} />}
                {existingUnit && <p className="mt-1 text-xs text-ink-3">{productOutput.code ? `${productOutput.code} · ` : ''}{existingUnit}</p>}
                {template && (
                    <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {unitFields.map(field => {
                            const error = errors[`${prefix}.unit.${field.key}`];
                            return (
                                <div key={field.key}>
                                    <input
                                        aria-label={`${field.label} línea ${index + 1}`}
                                        placeholder={field.label + (field.required ? ' *' : '')}
                                        value={productOutput.unit?.[field.key] ?? ''}
                                        onChange={(e) => updateUnit(index, field.key, field.type === 'year' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                                        inputMode={field.type === 'number' ? 'decimal' : field.type === 'year' ? 'numeric' : undefined}
                                        maxLength={field.type === 'year' ? 4 : 300}
                                        className={`${cellInput} ${error ? cellInputError : cellInputNormal}`}
                                    />
                                    {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
                                </div>
                            );
                        })}
                        {!template.code_field_id && (
                            <div>
                                <input
                                    aria-label={`Código unidad línea ${index + 1}`}
                                    placeholder="Código *"
                                    value={productOutput.unit_code ?? ''}
                                    onChange={(e) => updateUnit(index, null, e.target.value)}
                                    maxLength={25}
                                    className={`${cellInput} ${errors[`${prefix}.unit_code`] ? cellInputError : cellInputNormal}`}
                                />
                                {errors[`${prefix}.unit_code`] && <p className="mt-0.5 text-xs text-red-500">{errors[`${prefix}.unit_code`]}</p>}
                            </div>
                        )}
                    </div>
                )}
                {template && (
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-ink-3">
                            {codePreview !== null && <>Código: <span className="font-semibold text-ink-1 tabular-nums">{codePreview || `${template.code_prefix ?? ''}…`}</span></>}
                        </span>
                        {!xml && (
                            <button type="button" onClick={() => addUnitLine(index)} className="px-2 py-1 rounded-md font-medium text-primary hover:bg-primary/10 cursor-pointer">
                                + Agregar otra unidad
                            </button>
                        )}
                    </div>
                )}
                {lineError && <p className="mt-1 text-xs text-red-500">{lineError}</p>}
                {inventory && productOutput.product_id > 0 && !unitLine && (
                    <PresentationLabel
                        productId={productOutput.product_id}
                        presentations={productOutput.presentations}
                        value={productOutput.presentation_id}
                        conversionFactor={productOutput.conversion_factor}
                    />
                )}
            </td>
            <td className="max-md:col-start-2">
                <span className="md:hidden block text-[11px] text-ink-3 mb-0.5">Cant.</span>
                <input
                    aria-label={`Cantidad línea ${index + 1}`}
                    onChange={(e) => updateItem(index, 'quantity', limitDecimals(e.target.value, 6))}
                    value={productOutput.quantity ?? ''}
                    type="text"
                    inputMode="decimal"
                    // Cada unidad (moto) va en su línea con cantidad 1
                    readOnly={unitLine || !!xml}
                    title={xml ? 'Cantidad del XML' : unitLine ? 'Una unidad por línea' : undefined}
                    className={`${inputBase} ${unitLine || xml ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
            </td>
            <td>
                <span className="md:hidden block text-[11px] text-ink-3 mb-0.5">{onlyProducts ? 'Costo unit.' : 'Precio'}</span>
                <input
                    aria-label={`Precio línea ${index + 1}`}
                    onChange={(e) => updateItem(index, 'price', limitDecimals(e.target.value, 6))}
                    value={productOutput.price ?? ''}
                    type="text"
                    inputMode="decimal"
                    readOnly={!!xml}
                    title={xml ? 'Costo del XML (con ICE, sin IVA)' : undefined}
                    className={`${inputBase} ${xml ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
            </td>
            <td className="text-right tabular-nums text-ink-1 md:pt-3.5!"><span className="md:hidden block text-[11px] text-ink-3 mb-0.5">Subtotal</span><span className="max-md:block max-md:py-1.5">{Number(productOutput.total_iva ?? 0).toFixed(2)}</span></td>
            <td className="w-1 py-0.5!">
                {!xml && <IconButton action="delete" type="button" onClick={() => deleteItem(index)} title="Eliminar línea" />}
            </td>
        </tr>
    );
};

// Varios códigos en un valor (ej. serie1 con un chasis por moto) se copian por separado
const valueParts = (value: string) => {
    const parts = value.split(/[\s,;]+/).filter(Boolean);
    return parts.length > 1 && parts.every(part => /^[A-Z0-9-]{6,}$/i.test(part) && /\d/.test(part)) ? parts : [value];
};

// Información adicional del detalle del XML, solo de referencia: un clic copia el valor
const XmlAdditional = ({ additional }: { additional: Record<string, string> }) => {
    const [copied, setCopied] = useState<string | null>(null);
    const entries = Object.entries(additional ?? {}).filter(([, value]) => value);
    if (entries.length === 0) return null;

    const copy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(value);
            setTimeout(() => setCopied(current => current === value ? null : current), 1200);
        } catch {
            // Sin permiso de portapapeles: el texto sigue seleccionable
        }
    };

    return (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {entries.map(([name, value]) => (
                <span key={name} className="inline-flex max-w-full flex-wrap items-center gap-1">
                    <span className="text-ink-3">{name}:</span>
                    {valueParts(value).map((part, i) => (
                        <button
                            key={`${part}-${i}`}
                            type="button"
                            onClick={() => copy(part)}
                            title="Copiar"
                            className="max-w-full break-all text-left rounded border border-line px-1.5 py-0.5 font-mono text-ink-1 select-all hover:border-primary hover:text-primary cursor-pointer"
                        >
                            {copied === part ? 'Copiado' : part}
                        </button>
                    ))}
                </span>
            ))}
        </div>
    );
};
