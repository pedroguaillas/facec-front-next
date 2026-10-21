"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";
import { FaPlus } from "react-icons/fa";
import { IconButton, Notice, PrimaryButton, SegmentedControl, SelectOption, SelectProduct, TableResponsive, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useInventory } from "@/lib/hooks/useInventory";
import { useToast } from "@/context/ToastContext";
import { getDate } from "@/helpers/dateHelper";
import { limitDecimals } from "@/helpers/numberHelper";
import { ApiResponse, InventoryDirection, InventoryItemForm, InventoryOperationResponse, ProductProps } from "@/types";
import { getEditProduct } from "../../products/services/productServices";
import { storeAdjustment, storeOpeningBalance, storeTransfer } from "../services/inventoryServices";
import { formatQty } from "../helpers/inventoryHelper";
import { useWarehouses } from "../hooks/useWarehouses";

export type InventoryOperationMode = 'adjustment' | 'transfer' | 'opening';

interface Props {
    mode: InventoryOperationMode;
    // Producto con el que arranca la primera línea (ej. "Ajuste" desde el kardex)
    initialProductId?: string;
}

const newItem = (): InventoryItemForm => ({ id: nanoid(), product_id: 0, quantity: '', unit_cost: '' });

const cellInput = 'w-full min-w-24 border rounded-lg px-2 py-1.5 text-sm text-right bg-[var(--background)] focus:outline-none dark:text-gray-300';
const cellNormal = 'border-[var(--border-strong)] focus:border-primary';
const cellError = 'border-red-400 focus:border-red-500';

const directionOptions: { label: string; value: InventoryDirection }[] = [
    { label: 'Ingreso', value: 'in' },
    { label: 'Salida', value: 'out' },
];

export const InventoryOperationForm = ({ mode, initialProductId }: Props) => {
    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const { toast } = useToast();
    const { allowNegativeStock } = useInventory();
    const { warehouses, options: warehouseOptions, isLoading: loadingWarehouses } = useWarehouses();

    const [warehouseId, setWarehouseId] = useState('');
    const [toWarehouseId, setToWarehouseId] = useState('');
    const [direction, setDirection] = useState<InventoryDirection>('in');
    const [date, setDate] = useState(getDate());
    const [note, setNote] = useState('');
    const [items, setItems] = useState<InventoryItemForm[]>([newItem()]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    // Remonta los selectores de producto al limpiar el formulario
    const [formKey, setFormKey] = useState(0);

    // Bodega por defecto (la primera); en transferencias el destino es la siguiente
    useEffect(() => {
        if (warehouses.length === 0) return;
        setWarehouseId(prev => prev || String(warehouses[0].id));
        if (warehouses.length > 1) setToWarehouseId(prev => prev || String(warehouses[1].id));
    }, [warehouses]);

    useEffect(() => {
        if (!initialProductId || status !== 'authenticated') return;
        getEditProduct(initialProductId, axiosAuth).then(({ data }) => {
            if (!data || data.product.type_product !== 1) return;
            const { product } = data;
            setItems([{ ...newItem(), product_id: Number(product.id), name: `${product.code} - ${product.name}`, stock: product.stock }]);
        });
    }, [initialProductId, status, axiosAuth]);

    const showCost = mode === 'opening' || (mode === 'adjustment' && direction === 'in');
    const checksStock = (mode === 'adjustment' && direction === 'out') || mode === 'transfer';

    const clearError = (key: string) => setErrors(prev => (prev[key] ? { ...prev, [key]: '' } : prev));

    const updateItem = (index: number, field: 'quantity' | 'unit_cost', value: string) => {
        setItems(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
        clearError(`items.${index}.${field}`);
    };

    const selectProduct = (index: number, product: ProductProps) => {
        setItems(prev => prev.map((item, i) => (i === index
            ? { ...item, product_id: product.id, name: `${product.atts.code} - ${product.atts.name}`, stock: product.atts.stock }
            : item)));
        clearError(`items.${index}.product_id`);
        clearError('products');
    };

    const removeItem = (index: number) => {
        setItems(prev => (prev.length === 1 ? [newItem()] : prev.filter((_, i) => i !== index)));
        // Los errores por línea quedan desfasados al quitar una: se limpian
        setErrors(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith('items.'))));
    };

    const validate = () => {
        const found: Record<string, string> = {};
        if (!date) found.date = 'Fecha requerida';
        if (mode === 'adjustment' && !note.trim()) found.note = 'Indica el motivo del ajuste (ej. Rotura, Conteo físico)';
        if (mode === 'transfer' && warehouseId === toWarehouseId) found.to_warehouse_id = 'La bodega destino debe ser distinta del origen';
        items.forEach((item, index) => {
            if (!item.product_id) found[`items.${index}.product_id`] = 'Seleccione un producto';
            if (!(Number(item.quantity) > 0)) found[`items.${index}.quantity`] = 'Mayor a 0';
            if (showCost && item.unit_cost !== '' && Number(item.unit_cost) < 0) found[`items.${index}.unit_cost`] = 'Inválido';
        });
        const ids = items.map(item => item.product_id).filter(Boolean);
        if (new Set(ids).size !== ids.length) found.products = 'Hay productos repetidos: une las cantidades en una sola línea';
        return found;
    };

    const buildForm = () => {
        const lines = items.map(item => ({
            product_id: item.product_id,
            quantity: Number(item.quantity),
            ...(showCost && item.unit_cost !== '' ? { unit_cost: Number(item.unit_cost) } : {}),
        }));
        const common = { date, note: note.trim() || undefined, items: lines };
        if (mode === 'transfer') {
            return { ...common, from_warehouse_id: Number(warehouseId), to_warehouse_id: Number(toWarehouseId) };
        }
        return {
            ...common,
            warehouse_id: warehouseId ? Number(warehouseId) : undefined,
            ...(mode === 'adjustment' ? { direction } : {}),
        };
    };

    const reset = () => {
        setItems([newItem()]);
        setNote('');
        setErrors({});
        setFormKey(key => key + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(undefined);
        const found = validate();
        if (Object.values(found).some(Boolean)) {
            setErrors(found);
            return;
        }

        const form = buildForm();
        setIsSaving(true);
        let response: ApiResponse<InventoryOperationResponse>;
        if (mode === 'transfer') response = await storeTransfer(axiosAuth, form);
        else if (mode === 'opening') response = await storeOpeningBalance(axiosAuth, form);
        else response = await storeAdjustment(axiosAuth, form);
        setIsSaving(false);

        if (response.data) {
            toast(response.data.message || 'Movimiento registrado');
            reset();
            return;
        }
        if (response.errors) {
            setErrors(response.errors);
            // Stock insuficiente u otros errores sin campo visible
            const general = response.errors.products ?? response.errors.items ?? response.errors.warehouse_id;
            if (general) setMessage(general);
            return;
        }
        setMessage(response.error ?? 'No se pudo registrar el movimiento');
    };

    if (!loadingWarehouses && mode === 'transfer' && warehouses.length < 2) {
        return (
            <div className="mt-4">
                <Notice
                    tone="info"
                    title="Necesitas al menos dos bodegas para transferir"
                    action={<Link href="/inventory/warehouses" className="text-sm font-medium text-primary hover:underline">Crear bodega</Link>}
                />
            </div>
        );
    }

    const lineError = (index: number, field: string) => errors[`items.${index}.${field}`];

    return (
        <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
            {mode === 'opening' && (
                <div className="mb-3">
                    <Notice tone="info" title="Carga el stock con el que arrancas y su costo">
                        Solo para productos sin movimientos en la bodega. Si ya tienen movimientos, corrige con un ajuste.
                    </Notice>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                {mode === 'adjustment' && (
                    <div className="sm:col-span-2 lg:col-span-3">
                        <SegmentedControl label="Tipo de ajuste" name="direction" value={direction} options={directionOptions} onChange={(value) => { setDirection(value); clearError('products'); }} />
                    </div>
                )}
                {warehouses.length > 1 && (
                    <SelectOption
                        label={mode === 'transfer' ? 'Bodega origen' : 'Bodega'}
                        name="warehouse_id"
                        options={warehouseOptions}
                        selectedValue={warehouseId}
                        error={errors.warehouse_id || errors.from_warehouse_id}
                        handleSelect={(e) => { setWarehouseId(e.target.value); clearError('warehouse_id'); clearError('to_warehouse_id'); }}
                        required
                    />
                )}
                {mode === 'transfer' && (
                    <SelectOption
                        label="Bodega destino"
                        name="to_warehouse_id"
                        options={warehouseOptions}
                        selectedValue={toWarehouseId}
                        error={errors.to_warehouse_id}
                        handleSelect={(e) => { setToWarehouseId(e.target.value); clearError('to_warehouse_id'); }}
                        required
                    />
                )}
                <TextInput type="date" label="Fecha" name="date" value={date} error={errors.date} max={getDate()} onChange={(e) => { setDate(e.target.value); clearError('date'); }} required />
                <div className={mode === 'transfer' ? 'sm:col-span-2 lg:col-span-3' : 'sm:col-span-2'}>
                    <TextInput
                        label={mode === 'adjustment' ? 'Motivo' : 'Nota'}
                        name="note"
                        value={note}
                        error={errors.note}
                        maxLength={255}
                        placeholder={mode === 'adjustment' ? 'Ej. Rotura, Conteo físico, Muestra' : 'Opcional'}
                        onChange={(e) => { setNote(e.target.value); clearError('note'); }}
                        required={mode === 'adjustment'}
                    />
                </div>
            </div>

            <TableResponsive>
                <thead>
                    <tr>
                        <th className="text-left">PRODUCTO</th>
                        <th className="text-right">STOCK</th>
                        <th className="text-right">CANTIDAD</th>
                        {showCost && <th className="text-right">COSTO UNIT.</th>}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const exceeds = checksStock && item.product_id > 0 && item.stock !== null && item.stock !== undefined
                            && Number(item.quantity) > Number(item.stock);
                        return (
                            <tr key={`${formKey}-${item.id}`} className="align-top">
                                <td className="min-w-64">
                                    <SelectProduct index={index} label={item.name} error={lineError(index, 'product_id')} selectProduct={selectProduct} onlyProducts />
                                </td>
                                <td className="text-right tabular-nums text-ink-3 pt-4!">
                                    {item.product_id > 0 && item.stock !== null && item.stock !== undefined ? formatQty(item.stock) : '-'}
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.000001"
                                        min="0"
                                        aria-label={`Cantidad línea ${index + 1}`}
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', limitDecimals(e.target.value, 6))}
                                        className={`${cellInput} ${lineError(index, 'quantity') ? cellError : cellNormal}`}
                                    />
                                    {lineError(index, 'quantity') && <p className="text-xs text-red-500 mt-1 text-right">{lineError(index, 'quantity')}</p>}
                                    {!lineError(index, 'quantity') && exceeds && (
                                        <p className={`text-xs mt-1 text-right ${allowNegativeStock ? 'text-sri-wait' : 'text-red-500'}`}>
                                            {allowNegativeStock ? 'Supera el stock: quedará en negativo' : 'Supera el stock disponible'}
                                        </p>
                                    )}
                                </td>
                                {showCost && (
                                    <td>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.000001"
                                            min="0"
                                            aria-label={`Costo unitario línea ${index + 1}`}
                                            placeholder={mode === 'adjustment' ? 'Promedio' : '0.00'}
                                            value={item.unit_cost}
                                            onChange={(e) => updateItem(index, 'unit_cost', limitDecimals(e.target.value, 6))}
                                            className={`${cellInput} ${lineError(index, 'unit_cost') ? cellError : cellNormal}`}
                                        />
                                        {lineError(index, 'unit_cost') && <p className="text-xs text-red-500 mt-1 text-right">{lineError(index, 'unit_cost')}</p>}
                                    </td>
                                )}
                                <td className="w-1">
                                    <IconButton type="button" action="delete" onClick={() => removeItem(index)} title="Eliminar línea" />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </TableResponsive>

            <button
                type="button"
                onClick={() => setItems(prev => [...prev, newItem()])}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 cursor-pointer"
            >
                <FaPlus className="text-xs" /> Agregar producto
            </button>

            {showCost && mode === 'adjustment' && (
                <p className="text-xs text-ink-3 mt-2">Sin costo, el ingreso entra al costo promedio vigente.</p>
            )}

            {message && <p className="mt-4 text-sm text-red-500" role="alert">{message}</p>}

            <div className="flex justify-end mt-4">
                <div className="w-36">
                    <PrimaryButton label="Registrar" type="submit" action="store" isLoading={isSaving} />
                </div>
            </div>
        </form>
    );
};
