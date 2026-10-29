"use client";

import { useRef, useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from "react-icons/fa";
import { Modal, Notice, PrimaryButton, SelectOption, Switch, TextInput } from "@/components";
import { MAX_SRI_TEMPLATE_FIELDS, productTemplateSchema } from "@/schemas/product-template.schema";
import { storeProductTemplate, updateProductTemplate } from "@/services/productTemplateServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { ProductTemplate, ProductTemplateField, ProductTemplateFieldLevel, ProductTemplateFieldType } from "@/types";

// Fila del editor: `uid` identifica la fila aunque el campo aún no tenga id ni key
interface FieldRow extends Omit<ProductTemplateField, 'id' | 'product_template_id' | 'sort'> {
    uid: string;
    id?: number;
}

const typeOptions: { value: ProductTemplateFieldType; label: string }[] = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'year', label: 'Año' },
];

const levelOptions: { value: ProductTemplateFieldLevel; label: string }[] = [
    { value: 'modelo', label: 'Modelo' },
    { value: 'unidad', label: 'Unidad' },
];

// Igual que el backend: "Año" → "ano", "N° Motor" → "n_motor"
const keyFromLabel = (label: string) => label
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const isCodeEligible = (field: FieldRow) => field.level === 'unidad' && field.unique && field.active;

const cellInput = 'w-full min-w-0 border rounded-lg px-3 py-2 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors';

interface Props {
    template: ProductTemplate | null;
    onClose: () => void;
    onSaved: () => void;
}

export const ProductTemplateFormModal = ({ template, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const nextUid = useRef(0);
    const newUid = () => `new-${nextUid.current++}`;

    const [name, setName] = useState(template?.name ?? '');
    const [active, setActive] = useState(template?.active ?? true);
    const [codePrefix, setCodePrefix] = useState(template?.code_prefix ?? '');
    const [fields, setFields] = useState<FieldRow[]>(() =>
        [...(template?.fields ?? [])]
            .sort((a, b) => a.sort - b.sort)
            .map(field => ({
                uid: `id-${field.id}`, id: field.id, key: field.key, label: field.label, type: field.type, level: field.level,
                required: field.required, unique: field.unique, in_sri: field.in_sri, active: field.active,
            }))
    );
    const [codeFieldUid, setCodeFieldUid] = useState(template?.code_field_id ? `id-${template.code_field_id}` : '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const sriCount = fields.filter(f => f.active && f.in_sri).length;
    const codeOptions = fields.filter(isCodeEligible).map(f => ({ value: f.uid, label: f.label || 'Sin nombre' }));
    const codeField = fields.find(f => f.uid === codeFieldUid);

    const clearError = (key: string) => setErrors(prev => prev[key] ? { ...prev, [key]: '' } : prev);

    const updateField = (uid: string, changes: Partial<FieldRow>) => {
        const current = fields.find(f => f.uid === uid);
        if (!current) return;
        const updated = { ...current, ...changes };
        // La key de un campo guardado no cambia (el backend lo rechaza si ya tiene valores)
        if (changes.label !== undefined && !current.id) updated.key = keyFromLabel(changes.label);
        setFields(prev => prev.map(f => f.uid === uid ? updated : f));
        // Un campo que deja de ser de unidad, único o activo no puede armar el código
        if (uid === codeFieldUid && !isCodeEligible(updated)) setCodeFieldUid('');
        clearError('fields');
    };

    const addField = () => {
        setFields(prev => [...prev, { uid: newUid(), key: '', label: '', type: 'text', level: 'unidad', required: false, unique: false, in_sri: false, active: true }]);
        clearError('fields');
    };

    const removeField = (uid: string) => {
        setFields(prev => prev.filter(f => f.uid !== uid));
        if (uid === codeFieldUid) setCodeFieldUid('');
        // Los errores por fila van por índice: al quitar una fila dejan de corresponder
        setErrors(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith('fields.'))));
    };

    const moveField = (index: number, direction: -1 | 1) => {
        setFields(prev => {
            const next = [...prev];
            [next[index], next[index + direction]] = [next[index + direction], next[index]];
            return next;
        });
        setErrors(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith('fields.'))));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = productTemplateSchema.safeParse({
            name,
            code_prefix: (codeField && codePrefix.trim()) || null,
            code_field_key: codeField?.key || null,
            active,
            fields: fields.map((field, index) => ({
                id: field.id, key: field.key, label: field.label.trim(), type: field.type, level: field.level,
                required: field.required, unique: field.unique, in_sri: field.in_sri, sort: index + 1, active: field.active,
            })),
        });
        if (!parsed.success) {
            // Ruta completa (fields.0.label) para ubicar el error en su fila, igual que Laravel
            setErrors(Object.fromEntries(parsed.error.errors.map(err => [err.path.join('.'), err.message])));
            return;
        }

        setIsSaving(true);
        const response = template
            ? await updateProductTemplate(axiosAuth, template.id, parsed.data)
            : await storeProductTemplate(axiosAuth, parsed.data);
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }
        if (response.error) {
            setErrors({ fields: response.error });
            return;
        }
        onSaved();
    };

    const codeExample = codeField ? `${codePrefix.trim()}5452` : '';

    return (
        <Modal isOpen title={template ? 'Editar plantilla' : 'Nueva plantilla'} subtitle="Características que se piden al registrar cada producto" onClose={onClose} modalSize="xl">
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end gap-x-6">
                    <TextInput label="Nombre" name="name" value={name} error={errors.name} onChange={(e) => { setName(e.target.value); clearError('name'); }} maxLength={100} placeholder="Ej. Moto" autoFocus={!template} required />
                    <div className="my-2">
                        <Switch name="active" label="Activa" checked={active} onChange={(e) => setActive(e.target.checked)} />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <strong className="font-bold">Características</strong>
                    <span className={`text-xs tabular-nums ${sriCount >= MAX_SRI_TEMPLATE_FIELDS ? 'text-sri-wait' : 'text-ink-3'}`}>
                        SRI {sriCount}/{MAX_SRI_TEMPLATE_FIELDS}
                    </span>
                </div>
                <p className="text-xs text-ink-3 mt-1">
                    <b>Modelo</b>: la comparten todas las unidades (Marca, Año). <b>Unidad</b>: propia de cada una (Chasis, Motor).
                    Hasta {MAX_SRI_TEMPLATE_FIELDS} van a la información adicional del SRI; el PDF muestra todas.
                </p>

                {errors.fields && <div className="mt-3"><Notice tone="danger" title={errors.fields} /></div>}

                <ul className="mt-3 flex flex-col gap-3">
                    {fields.map((field, index) => {
                        const rowError = errors[`fields.${index}.label`] || errors[`fields.${index}.key`] || errors[`fields.${index}.id`];
                        const sriDisabled = !field.in_sri && sriCount >= MAX_SRI_TEMPLATE_FIELDS;
                        return (
                            <li key={field.uid} className={`rounded-lg border p-3 ${field.active ? 'border-line' : 'border-dashed border-line opacity-70'}`}>
                                <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_auto] gap-2 items-start">
                                    <div className="col-span-2 sm:col-span-1">
                                        <input
                                            aria-label={`Nombre característica ${index + 1}`}
                                            value={field.label}
                                            onChange={(e) => { updateField(field.uid, { label: e.target.value }); clearError(`fields.${index}.label`); }}
                                            placeholder="Ej. Chasis"
                                            maxLength={100}
                                            className={`${cellInput} ${rowError ? 'border-red-400' : 'border-[var(--border-strong)]'}`}
                                        />
                                        {rowError && <p className="mt-1 text-xs text-red-500">{rowError}</p>}
                                    </div>
                                    <select aria-label="Tipo" value={field.type} onChange={(e) => updateField(field.uid, { type: e.target.value as ProductTemplateFieldType })} className={`${cellInput} border-[var(--border-strong)]`}>
                                        {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <select aria-label="Nivel" value={field.level} onChange={(e) => updateField(field.uid, { level: e.target.value as ProductTemplateFieldLevel })} className={`${cellInput} border-[var(--border-strong)]`}>
                                        {levelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end gap-1">
                                        <button type="button" onClick={() => moveField(index, -1)} disabled={index === 0} title="Subir" aria-label="Subir" className="inline-flex items-center justify-center min-w-9 min-h-9 rounded-full text-ink-3 hover:bg-surface-sunken disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><FaArrowUp className="text-xs" /></button>
                                        <button type="button" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} title="Bajar" aria-label="Bajar" className="inline-flex items-center justify-center min-w-9 min-h-9 rounded-full text-ink-3 hover:bg-surface-sunken disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><FaArrowDown className="text-xs" /></button>
                                        <button type="button" onClick={() => removeField(field.uid)} title="Eliminar" aria-label="Eliminar" className="inline-flex items-center justify-center min-w-9 min-h-9 rounded-full text-danger hover:bg-red-100 dark:hover:bg-red-950 cursor-pointer"><FaTrash className="text-xs" /></button>
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.uid, { required: e.target.checked })} className="size-4 accent-primary" />
                                        Requerido
                                    </label>
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={field.unique} onChange={(e) => updateField(field.uid, { unique: e.target.checked })} className="size-4 accent-primary" />
                                        Único
                                    </label>
                                    <label className={`inline-flex items-center gap-2 ${sriDisabled ? 'cursor-not-allowed text-ink-4' : 'cursor-pointer'}`} title={sriDisabled ? `Ya hay ${MAX_SRI_TEMPLATE_FIELDS} en el SRI` : undefined}>
                                        <input type="checkbox" checked={field.in_sri} disabled={sriDisabled} onChange={(e) => updateField(field.uid, { in_sri: e.target.checked })} className="size-4 accent-primary" />
                                        En el SRI
                                    </label>
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={field.active} onChange={(e) => updateField(field.uid, { active: e.target.checked })} className="size-4 accent-primary" />
                                        Activa
                                    </label>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <button type="button" onClick={addField} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-2.5 text-sm font-medium text-ink-2 hover:bg-surface-sunken hover:text-ink-1 cursor-pointer">
                    <FaPlus className="text-xs" /> Agregar característica
                </button>

                <div className="mt-6">
                    <strong className="font-bold">Código de cada unidad</strong>
                    <p className="text-xs text-ink-3 mt-1">Opcional. Solo aparecen las características de unidad marcadas como únicas.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_8rem] gap-x-4">
                        <SelectOption
                            label="Campo para el código"
                            name="code_field_key"
                            options={[{ value: '', label: 'Sin código' }, ...codeOptions]}
                            selectedValue={codeFieldUid}
                            error={errors.code_field_key}
                            handleSelect={(e) => { setCodeFieldUid(e.target.value); clearError('code_field_key'); }}
                        />
                        <TextInput label="Prefijo" name="code_prefix" value={codePrefix} error={errors.code_prefix} onChange={(e) => { setCodePrefix(e.target.value.toUpperCase()); clearError('code_prefix'); }} maxLength={5} placeholder="Ej. M" disabled={!codeField} />
                    </div>
                    {codeField && (
                        <p className="text-xs text-ink-3">
                            {codePrefix.trim() ? `"${codePrefix.trim()}" + ` : ''}{codeField.label} 5452 → <span className="font-semibold text-ink-1 tabular-nums">{codeExample}</span>
                        </p>
                    )}
                </div>

                <div className="mt-6 sm:flex sm:justify-end">
                    <div className="sm:w-32">
                        <PrimaryButton label="Guardar" type="submit" action="store" isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    );
};
