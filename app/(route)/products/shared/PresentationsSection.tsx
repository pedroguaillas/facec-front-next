"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, FormModal, IconButton, Separate, Switch, TableResponsive, TextInput } from "@/components";
import { formatFactor } from "@/helpers/presentationHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { invalidatePresentations } from "@/lib/hooks/useProductPresentations";
import { useToast } from "@/context/ToastContext";
import { ProductPresentation } from "@/types";
import {
    deletePresentation,
    getPresentations,
    ProductPresentationForm,
    storePresentation,
    updatePresentation,
} from "@/services/productPresentationServices";
import { useProductCreateContext } from "../context/ProductFormContext";

const emptyForm: ProductPresentationForm = { name: '', conversion_factor: '', price: '', code: '', active: true };

const decimals = (value: number | string) => (String(value).split('.')[1] ?? '').length;

// Fila de la tabla: presentación guardada o borrador (al crear; id = key temporal)
type Row = Pick<ProductPresentation, 'id' | 'name' | 'code' | 'conversion_factor' | 'active'> & { price: number | string | null };

// Presentaciones de venta/compra (ej. "Cubeta x30"). Al editar se guardan al momento;
// al crear quedan como borrador y viajan en el mismo POST products (ButtonSubmit)
export const PresentationsSection = () => {
    const { product, isEdit, draftPresentations, setDraftPresentations, draftErrors, setDraftErrors } = useProductCreateContext();
    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const [presentations, setPresentations] = useState<ProductPresentation[]>([]);
    // null = cerrado; id 0 = nueva
    const [editing, setEditing] = useState<{ id: number; snapshot: ProductPresentationForm } | null>(null);
    const [form, setForm] = useState<ProductPresentationForm>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const productId = Number(product.id);

    const fetchPresentations = useCallback(async () => {
        if (!isEdit || !productId) return;
        const { data } = await getPresentations(axiosAuth, productId);
        if (data) setPresentations(data.data);
        // Las líneas de venta/compra abiertas en esta sesión vuelven a pedirlas
        invalidatePresentations(productId);
    }, [axiosAuth, isEdit, productId]);

    useEffect(() => {
        fetchPresentations();
    }, [fetchPresentations]);

    const rows: Row[] = isEdit
        ? presentations
        : draftPresentations.map(draft => ({ ...draft, id: draft.key, code: draft.code ?? null, price: draft.price ?? null, conversion_factor: Number(draft.conversion_factor) }));

    // Al corregir o quitar un borrador se limpian sus errores (y el general, que depende del conjunto)
    const clearDraftErrors = (key: number) => setDraftErrors(prev => {
        const rowsLeft = { ...prev.rows };
        delete rowsLeft[key];
        return { rows: rowsLeft };
    });

    const open = (presentation?: Row) => {
        const values: ProductPresentationForm = presentation
            ? { name: presentation.name, conversion_factor: String(presentation.conversion_factor), price: String(presentation.price ?? ''), code: presentation.code ?? '', active: presentation.active !== false }
            : emptyForm;
        setForm(values);
        setEditing({ id: presentation?.id ?? 0, snapshot: values });
        // Borrador rechazado por el backend: sus errores aparecen bajo cada campo al abrirlo
        setErrors(!isEdit && presentation ? draftErrors.rows[presentation.id] ?? {} : {});
        setMessage(undefined);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const submit = async () => {
        if (!editing) return;
        const found: Record<string, string> = {};
        if (!form.name.trim()) found.name = 'Nombre requerido';
        // Al crear no hay backend que valide aún: se evita repetir código entre borradores y con el del producto
        const code = form.code?.trim().toLowerCase();
        if (!isEdit && code && (code === product.code.trim().toLowerCase()
            || draftPresentations.some(d => d.key !== editing.id && d.code?.trim().toLowerCase() === code))) {
            found.code = 'El código ya se usa en este producto';
        }
        if (!(Number(form.conversion_factor) >= 0.000001)) found.conversion_factor = 'Mínimo 0.000001';
        else if (decimals(form.conversion_factor) > 6) found.conversion_factor = 'Máximo 6 decimales';
        if (form.price !== '' && Number(form.price) < 0) found.price = 'Inválido';
        if (Object.keys(found).length) {
            setErrors(found);
            return;
        }

        const payload: ProductPresentationForm = {
            name: form.name.trim(),
            conversion_factor: Number(form.conversion_factor),
            // Vacío = precio del producto × factor
            price: form.price === '' ? null : Number(form.price),
            code: form.code?.trim() || null,
            active: form.active !== false,
        };

        if (!isEdit) {
            setDraftPresentations(prev => editing.id
                ? prev.map(draft => draft.key === editing.id ? { ...payload, key: draft.key } : draft)
                : [...prev, { ...payload, key: Date.now() }]);
            clearDraftErrors(editing.id);
            setEditing(null);
            return;
        }

        setIsPending(true);
        const response = editing.id
            ? await updatePresentation(axiosAuth, productId, editing.id, payload)
            : await storePresentation(axiosAuth, productId, payload);
        setIsPending(false);

        if (response.data) {
            toast(editing.id ? 'Presentación actualizada' : 'Presentación agregada');
            setEditing(null);
            fetchPresentations();
            return;
        }
        if (response.errors) setErrors(response.errors);
        else setMessage(response.error ?? 'No se pudo guardar la presentación');
    };

    const confirmDelete = async (accept: boolean) => {
        if (!accept || deleteId === null) return;
        if (!isEdit) {
            setDraftPresentations(prev => prev.filter(draft => draft.key !== deleteId));
            clearDraftErrors(deleteId);
            setDeleteId(null);
            return;
        }
        const { data, error, errors: deleteErrors } = await deletePresentation(axiosAuth, productId, deleteId);
        setDeleteId(null);
        if (data) {
            toast(data.message || 'Presentación eliminada');
            fetchPresentations();
        } else {
            toast(error ?? Object.values(deleteErrors ?? {})[0] ?? 'No se pudo eliminar la presentación', 'error');
        }
    };

    const suggestedPrice = Number(product.price1) * Number(form.conversion_factor || 0);

    return (
        <>
            <Separate />
            <div className="flex items-center justify-between gap-4">
                <div>
                    <strong className='font-bold'>Presentaciones</strong>
                    <p className="text-xs text-ink-3 mt-0.5">Vende o compra en cubetas, cajas, etc. El stock se lleva en la unidad del producto.</p>
                    {draftErrors.general && <p className="text-xs text-red-500 mt-1">{draftErrors.general}</p>}
                </div>
                <button
                    type="button"
                    onClick={() => open()}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 cursor-pointer"
                >
                    + Agregar
                </button>
            </div>

            {rows.length > 0 && (
                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="text-left">NOMBRE</th>
                            <th>CÓDIGO</th>
                            <th className="text-right">UNIDADES</th>
                            <th className="text-right">PRECIO</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(presentation => (
                            <tr key={presentation.id}>
                                <td className="text-left">
                                    {presentation.name}
                                    {presentation.active === false && (
                                        <span className="ml-2 inline-flex items-center rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-3">Inactiva</span>
                                    )}
                                    {!isEdit && draftErrors.rows[presentation.id] && (
                                        <p className="text-xs text-red-500 mt-0.5">{Object.values(draftErrors.rows[presentation.id]).join(' · ')}</p>
                                    )}
                                </td>
                                <td>{presentation.code ?? '—'}</td>
                                <td className="text-right tabular-nums">{formatFactor(presentation.conversion_factor)}</td>
                                <td className="text-right tabular-nums">
                                    {/* Borrador sin precio propio: precio del producto × unidades */}
                                    ${(presentation.price === null || presentation.price === ''
                                        ? Number(product.price1) * Number(presentation.conversion_factor)
                                        : Number(presentation.price)).toFixed(2)}
                                </td>
                                <td className="w-1">
                                    <div className="flex gap-1">
                                        <IconButton type="button" action="edit" onClick={() => open(presentation)} title="Editar" />
                                        <IconButton type="button" action="delete" onClick={() => setDeleteId(presentation.id)} title="Eliminar" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableResponsive>
            )}

            {editing && (
                <FormModal
                    title={editing.id ? 'Editar presentación' : 'Nueva presentación'}
                    subtitle={product.code || product.name ? `${product.code} - ${product.name}` : 'Producto nuevo'}
                    onClose={() => setEditing(null)}
                    onSubmit={submit}
                    isPending={isPending}
                    isDirty={JSON.stringify(form) !== JSON.stringify(editing.snapshot)}
                    message={message}
                    modalSize="sm"
                >
                    <TextInput label="Nombre" name="name" value={form.name} error={errors.name} maxLength={255} placeholder="Ej. Cubeta" onChange={handleChange} required />
                    <TextInput
                        type="text"
                        label="Unidades por presentación"
                        name="conversion_factor"
                        value={String(form.conversion_factor)}
                        error={errors.conversion_factor}
                        inputMode="decimal"
                        min="0.000001"
                        step="0.000001"
                        placeholder="Ej. 30"
                        hint="Cuántas unidades del producto trae (1 cubeta = 30 huevos)"
                        onChange={handleChange}
                        required
                    />
                    <TextInput
                        type="text"
                        label="Precio"
                        name="price"
                        value={String(form.price ?? '')}
                        error={errors.price}
                        inputMode="decimal"
                        min="0"
                        placeholder={suggestedPrice > 0 ? suggestedPrice.toFixed(2) : 'Opcional'}
                        hint="Sin IVA. Si lo dejas vacío se usa el precio del producto × unidades"
                        onChange={handleChange}
                    />
                    <TextInput label="Código" name="code" value={form.code ?? ''} error={errors.code} maxLength={25} placeholder="Opcional (ej. código de barras)" onChange={handleChange} />
                    <Switch
                        name="active"
                        label="Activa"
                        description="Las inactivas no se ofrecen en ventas ni compras nuevas"
                        checked={form.active !== false}
                        onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))}
                    />
                </FormModal>
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmDelete}
                title="¿Eliminar esta presentación?"
                sutTitle={isEdit ? "Solo se pueden eliminar las presentaciones que no se han usado en ventas o compras." : "Aún no se ha guardado; se quita de la lista."}
            />
        </>
    );
};
