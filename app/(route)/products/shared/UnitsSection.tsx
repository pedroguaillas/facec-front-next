"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, FormModal, IconButton, Separate, TableResponsive, TextInput } from "@/components";
import { pickTemplateDetails, templateFieldsOf, unitCodeOf, validateTemplateDetails } from "@/helpers/productTemplateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useToast } from "@/context/ToastContext";
import { getUnits, storeUnit, updateUnit } from "@/services/productUnitServices";
import { ProductUnit } from "@/types";
import { deleteProduct } from "../services/productServices";
import { useProductCreateContext } from "../context/ProductFormContext";
import { TemplateDetailInput } from "./TemplateDetailInput";

interface UnitForm {
    details: Record<string, string>;
    code: string;
}

const emptyForm: UnitForm = { details: {}, code: '' };

// Unidades de un modelo con plantilla (ej. cada moto con su chasis y motor). Cada una es un
// producto con stock 1 que copia nombre, precio e IVA del modelo
export const UnitsSection = () => {
    const { product, productTemplates, savedTemplateId } = useProductCreateContext();
    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const [units, setUnits] = useState<ProductUnit[] | null>(null);
    // null = cerrado; id 0 = nueva
    const [editing, setEditing] = useState<{ id: number; snapshot: UnitForm } | null>(null);
    const [form, setForm] = useState<UnitForm>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const productId = Number(product.id);
    const template = productTemplates.find(t => t.id === savedTemplateId);
    const unitFields = templateFieldsOf(template, 'unidad');
    // Con campo de código el backend lo arma solo (prefijo + valor); sin él se escribe a mano
    const hasCodeField = !!template?.code_field_id;
    const codeField = template?.fields.find(f => f.id === template.code_field_id);

    const fetchUnits = useCallback(async () => {
        if (!productId) return;
        const { data } = await getUnits(axiosAuth, productId);
        setUnits(data ?? []);
    }, [axiosAuth, productId]);

    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

    const open = (unit?: ProductUnit) => {
        const values: UnitForm = unit ? { details: pickTemplateDetails(unitFields, unit.details), code: unit.code } : emptyForm;
        setForm(values);
        setEditing({ id: unit?.id ?? 0, snapshot: values });
        setErrors({});
        setMessage(undefined);
    };

    const handleDetail = (key: string, value: string) => {
        setForm(prev => ({ ...prev, details: { ...prev.details, [key]: value } }));
        setErrors(prev => ({ ...prev, [`details.${key}`]: '' }));
    };

    const submit = async () => {
        if (!editing) return;
        const found = Object.fromEntries(Object.entries(validateTemplateDetails(unitFields, form.details)).map(([key, msg]) => [`details.${key}`, msg]));
        if (!hasCodeField && !form.code.trim()) found.code = 'Código requerido';
        if (Object.keys(found).length) {
            setErrors(found);
            return;
        }

        const payload = { details: pickTemplateDetails(unitFields, form.details), code: hasCodeField ? null : form.code.trim() };
        setIsPending(true);
        const response = editing.id
            ? await updateUnit(axiosAuth, productId, editing.id, payload)
            : await storeUnit(axiosAuth, productId, payload);
        setIsPending(false);

        if (response.data) {
            toast(editing.id ? 'Unidad actualizada' : 'Unidad agregada');
            setEditing(null);
            fetchUnits();
            return;
        }
        if (response.errors) {
            setErrors(response.errors);
            // `product`: el modelo no admite unidades o la unidad ya se usó en comprobantes
            if (response.errors.product) setMessage(response.errors.product);
        } else {
            setMessage(response.error ?? 'No se pudo guardar la unidad');
        }
    };

    const confirmDelete = async (accept: boolean) => {
        const id = deleteId;
        setDeleteId(null);
        if (!accept || id === null) return;
        const { error, errors: deleteErrors } = await deleteProduct(id, axiosAuth);
        if (error || deleteErrors) {
            toast(error ?? Object.values(deleteErrors ?? {})[0] ?? 'No se pudo eliminar la unidad', 'error');
            return;
        }
        toast('Unidad eliminada');
        fetchUnits();
    };

    const codePreview = unitCodeOf(template, form.details);

    return (
        <>
            <Separate />
            <div className="flex items-center justify-between gap-4">
                <div>
                    <strong className='font-bold'>Unidades</strong>
                    <p className="text-xs text-ink-3 mt-0.5">
                        Cada unidad ({unitFields.map(f => f.label).join(', ')}) se vende por separado con stock 1, con el nombre, precio e IVA de este producto.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => open()}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 cursor-pointer"
                >
                    + Agregar
                </button>
            </div>

            {units === null ? (
                <p className="py-3 text-sm text-ink-3">Cargando…</p>
            ) : units.length === 0 ? (
                <p className="py-3 text-sm text-ink-3">Aún no hay unidades registradas.</p>
            ) : (
                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="text-left">CÓDIGO</th>
                            {unitFields.map(f => <th key={f.key} className="text-left">{f.label.toUpperCase()}</th>)}
                            <th className="text-right">STOCK</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map(unit => (
                            <tr key={unit.id}>
                                <td className="text-left tabular-nums">{unit.code}</td>
                                {unitFields.map(f => <td key={f.key} className="text-left">{unit.details?.[f.key] || '—'}</td>)}
                                <td className="text-right tabular-nums">{unit.stock === null ? '—' : Number(unit.stock).toLocaleString('es-EC', { maximumFractionDigits: 6 })}</td>
                                <td className="w-1">
                                    <div className="flex gap-1">
                                        <IconButton type="button" action="edit" onClick={() => open(unit)} title="Editar" />
                                        <IconButton type="button" action="delete" onClick={() => setDeleteId(unit.id)} title="Eliminar" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableResponsive>
            )}

            {editing && (
                <FormModal
                    title={editing.id ? 'Editar unidad' : 'Nueva unidad'}
                    subtitle={`${product.code} - ${product.name}`}
                    onClose={() => setEditing(null)}
                    onSubmit={submit}
                    isPending={isPending}
                    isDirty={JSON.stringify(form) !== JSON.stringify(editing.snapshot)}
                    message={message}
                    modalSize="sm"
                >
                    {unitFields.map(field => (
                        <TemplateDetailInput key={field.key} field={field} value={form.details[field.key] ?? ''} error={errors[`details.${field.key}`]} onChange={handleDetail} />
                    ))}
                    {hasCodeField ? (
                        <p className="text-xs text-ink-3 my-2">
                            Código: <span className="font-semibold text-ink-1 tabular-nums">{codePreview || `${template?.code_prefix ?? ''}…`}</span>
                            {codeField && <> (se arma con {template?.code_prefix ? `"${template.code_prefix}" + ` : ''}{codeField.label})</>}
                        </p>
                    ) : (
                        <TextInput
                            label="Código"
                            name="code"
                            value={form.code}
                            error={errors.code}
                            maxLength={25}
                            onChange={(e) => { setForm(prev => ({ ...prev, code: e.target.value })); setErrors(prev => ({ ...prev, code: '' })); }}
                            required
                        />
                    )}
                </FormModal>
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmDelete}
                title="¿Eliminar esta unidad?"
                sutTitle="Solo se pueden eliminar las unidades que no se han usado en ventas o compras."
            />
        </>
    );
};
