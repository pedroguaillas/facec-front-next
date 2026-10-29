"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, IconButton, PrimaryButton } from "@/components";
import { deleteProductTemplate, getProductTemplates } from "@/services/productTemplateServices";
import { useToast } from "@/context/ToastContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { invalidateProductTemplates } from "@/lib/hooks/useProductTemplates";
import { ProductTemplate } from "@/types";
import { ProductTemplateFormModal } from "./ProductTemplateFormModal";

export const ProductTemplatesList = () => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const [templates, setTemplates] = useState<ProductTemplate[] | null>(null);
    // 'new' = registrar; ProductTemplate = editar
    const [editing, setEditing] = useState<ProductTemplate | 'new' | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchTemplates = useCallback(async () => {
        invalidateProductTemplates();
        const { data, error } = await getProductTemplates(axiosAuth);
        if (error) toast(error, 'error');
        setTemplates(data ?? []);
    }, [axiosAuth, toast]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleSaved = () => {
        toast(editing === 'new' ? 'Plantilla registrada' : 'Plantilla actualizada');
        setEditing(null);
        fetchTemplates();
    };

    const confirmDelete = async (accept: boolean) => {
        const id = deleteId;
        setDeleteId(null);
        if (!accept || id === null) return;

        const { data, error } = await deleteProductTemplate(axiosAuth, id);
        if (error) {
            // Con productos registrados no se elimina: se desactiva desde editar
            toast(error, 'error');
            return;
        }
        toast(data?.message ?? 'Plantilla eliminada');
        fetchTemplates();
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                <p className="text-sm text-ink-3">
                    Define qué datos pide cada tipo de producto (ej. una moto: Marca, Año, Chasis, Motor).
                </p>
                <div className="sm:w-40 shrink-0">
                    <PrimaryButton label="Nueva plantilla" type="button" action="add" onClick={() => setEditing('new')} />
                </div>
            </div>

            {templates === null ? (
                <p className="py-6 text-sm text-ink-3">Cargando…</p>
            ) : templates.length === 0 ? (
                <p className="py-6 text-sm text-ink-3">Aún no tienes plantillas.</p>
            ) : (
                <ul className="mt-4 divide-y divide-line border-y border-line">
                    {templates.map(template => {
                        const activeFields = template.fields.filter(f => f.active);
                        const codeField = template.fields.find(f => f.id === template.code_field_id);
                        return (
                            <li key={template.id} className="flex items-center gap-3 py-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-ink-1">{template.name}</span>
                                        {!template.active && (
                                            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-ink-3">Inactiva</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-ink-3 truncate">
                                        {activeFields.length > 0 ? activeFields.map(f => f.label).join(' · ') : 'Sin características'}
                                    </p>
                                    {codeField && (
                                        <p className="text-xs text-ink-3">
                                            Código: {template.code_prefix ? `${template.code_prefix} + ` : ''}{codeField.label}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0">
                                    <IconButton type="button" action="edit" onClick={() => setEditing(template)} title="Editar" />
                                    <IconButton type="button" action="delete" onClick={() => setDeleteId(template.id)} title="Eliminar" />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {editing && (
                <ProductTemplateFormModal
                    template={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={handleSaved}
                />
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmDelete}
                title="¿Eliminar esta plantilla?"
                sutTitle="Solo se eliminan las plantillas sin productos. Si ya tiene productos, desactívala desde editar."
            />
        </>
    );
};
