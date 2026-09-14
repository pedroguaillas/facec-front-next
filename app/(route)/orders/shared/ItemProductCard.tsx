"use client";

import { useState } from "react";
import { fields, ProductOutput } from "@/types/order";
import { Modal, IconButton, SelectProduct, PrimaryButton } from "@/components";
import { ProductProps } from "@/types";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { hasIceApplied } from "@/helpers/invoiceTotalsHelper";
import { limitDecimals } from "@/helpers/numberHelper";

interface Props {
    index: number;
    productOutput: ProductOutput;
    error?: Partial<Record<keyof ProductOutput, string>>;
    updateItem: (index: number, field: fields, value: number | string) => void;
    selectProduct: (index: number, product: ProductProps) => void;
    removeItem: (index: number) => void;
}

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm text-center bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const inputError = "border-red-400";
const inputNormal = "border-[var(--border-strong)]";
const stepperBtn = "w-9 h-9 shrink-0 rounded-md border border-[var(--border-strong)] text-lg leading-none cursor-pointer hover:border-primary";

export const ItemProductCard = ({ index, productOutput, error, updateItem, selectProduct, removeItem }: Props) => {

    const { isActiveIce } = useFormInvoice();
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="border border-[var(--border)] rounded-lg p-3 bg-[var(--background)]">
            <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-medium">{productOutput.name || 'Seleccionar producto...'}</p>
                <div className="flex shrink-0 gap-1 -mt-1 -mr-1">
                    <IconButton action="edit" type="button" onClick={() => setIsEditing(true)} title="Editar línea" />
                    <IconButton action="delete" type="button" onClick={() => removeItem(index)} title="Eliminar línea" />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="opacity-60">Cant: {productOutput.quantity || 0}</span>
                <span className="opacity-30">|</span>
                <span className="opacity-60">${Number(productOutput.price ?? 0).toFixed(2)}</span>
                <span className="font-bold ml-auto">${Number(productOutput.total_iva ?? 0).toFixed(2)}</span>
            </div>

            {error?.product_id && <p className="text-xs text-red-500 mt-1">{error.product_id}</p>}

            <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Editar Línea" modalSize="sm">
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-xs opacity-60 mb-1 block">Producto/Servicio</label>
                        <SelectProduct index={index} label={productOutput.name ?? ''} error={error?.product_id} selectProduct={selectProduct} />
                    </div>

                    <div>
                        <label className="text-xs opacity-60 mb-1 block">Cantidad</label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => updateItem(index, 'quantity', Math.max(0, Number(productOutput.quantity || 0) - 1))}
                                className={stepperBtn}
                            >
                                −
                            </button>
                            <input
                                onChange={(e) => updateItem(index, 'quantity', limitDecimals(e.target.value, 6))}
                                value={productOutput.quantity ?? ''}
                                type="number"
                                step="0.000001"
                                className={`${inputBase} ${error?.quantity ? inputError : inputNormal}`}
                            />
                            <button
                                type="button"
                                onClick={() => updateItem(index, 'quantity', Number(productOutput.quantity || 0) + 1)}
                                className={stepperBtn}
                            >
                                +
                            </button>
                        </div>
                        {error?.quantity && <p className="text-xs text-red-500 mt-1">{error.quantity}</p>}
                    </div>

                    <div>
                        <label className="text-xs opacity-60 mb-1 block">Precio Unitario</label>
                        <input
                            onChange={(e) => updateItem(index, 'price', limitDecimals(e.target.value, 6))}
                            value={productOutput.price ?? ''}
                            type="number"
                            step="0.000001"
                            className={`${inputBase} text-left ${error?.price ? inputError : inputNormal}`}
                        />
                        {error?.price && <p className="text-xs text-red-500 mt-1">{error.price}</p>}
                    </div>

                    <div>
                        <label className="text-xs opacity-60 mb-1 block">Descuento</label>
                        <input
                            onChange={(e) => updateItem(index, 'discount', limitDecimals(e.target.value, 2))}
                            value={productOutput.discount ?? ''}
                            type="number"
                            step="0.01"
                            className={`${inputBase} text-left ${error?.discount ? inputError : inputNormal}`}
                        />
                        {error?.discount && <p className="text-xs text-red-500 mt-1">{error.discount}</p>}
                    </div>

                    {isActiveIce && hasIceApplied(productOutput.ice) && (
                        <div>
                            <label className="text-xs opacity-60 mb-1 block">ICE</label>
                            <input
                                onChange={(e) => updateItem(index, 'ice', e.target.value)}
                                value={productOutput.ice}
                                type="number"
                                className={`${inputBase} text-left ${error?.ice ? inputError : inputNormal}`}
                            />
                            {error?.ice && <p className="text-xs text-red-500 mt-1">{error.ice}</p>}
                        </div>
                    )}

                    {productOutput.aux_cod && (
                        <div className="text-xs opacity-60 border-t border-[var(--border)] pt-2">
                            Código: {productOutput.aux_cod}
                        </div>
                    )}

                    <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center">
                        <span className="text-sm font-bold">Total Línea</span>
                        <input
                            onChange={(e) => updateItem(index, 'total_iva', limitDecimals(e.target.value, 2))}
                            value={productOutput.total_iva ?? ''}
                            type="number"
                            step="0.01"
                            className={`${inputBase} w-28 text-right ${error?.total_iva ? inputError : inputNormal}`}
                        />
                    </div>

                    <PrimaryButton
                        label="Guardar Cambios"
                        type="button"
                        action="store"
                        onClick={() => setIsEditing(false)}
                    />
                </div>
            </Modal>
        </div>
    );
};
