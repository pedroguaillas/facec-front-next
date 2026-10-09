"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PrimaryButton, Switch } from "@/components";
import { getCompany, updateCompany } from "../../services/companyServices";
import { useToast } from "@/context/ToastContext";
import { SESSION_UPDATABLE_PERMISSIONS } from "@/constants/sessionPermissions";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Company } from "@/types";

type PermissionKey = 'base5' | 'base8' | 'ice' | 'transport' | 'repayment' | 'printf' | 'guia_in_invoice' | 'import_in_invoice' | 'import_in_invoices';
type Permissions = Record<PermissionKey, boolean>;

// Mismos permisos del admin (PermissionFormCompany), sin contabilidad / agente de retención (tab General)
const groups: { title: string; items: { name: PermissionKey; label: string }[] }[] = [
    {
        title: 'Impuestos',
        items: [
            { name: 'base5', label: 'Registra productos de construcción (base 5%)?' },
            { name: 'base8', label: 'IVA diferenciado 8% en feriados (servicios turísticos)' },
            { name: 'ice', label: 'Registra ICE?' },
        ],
    },
    {
        title: 'Ventas',
        items: [
            { name: 'transport', label: 'Registra servicio de transporte?' },
            { name: 'repayment', label: 'Emite factura por rembolso?' },
            { name: 'printf', label: 'Imprime tickets?' },
            { name: 'guia_in_invoice', label: 'Registra guía en factura?' },
            { name: 'import_in_invoice', label: 'Importa productos en venta?' },
            { name: 'import_in_invoices', label: 'Hace carga masiva de ventas?' },
        ],
    },
];

const keys = groups.flatMap(group => group.items.map(item => item.name));

const pick = (company: Partial<Company>): Permissions =>
    Object.fromEntries(keys.map(key => [key, !!company[key]])) as Permissions;

export const PermissionsForm = () => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const { update } = useSession();
    const [form, setForm] = useState<Permissions | null>(null);
    const [snapshot, setSnapshot] = useState<Permissions | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getCompany(axiosAuth).then(({ data }) => {
            if (!data) return;
            const permissions = pick(data);
            setForm(permissions);
            setSnapshot(permissions);
        });
    }, [axiosAuth]);

    const isDirty = JSON.stringify(form) !== JSON.stringify(snapshot);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setForm(prev => prev && ({ ...prev, [name]: checked }));
    };

    const submit = async () => {
        if (!form) return;
        const formData = new FormData();
        keys.forEach(key => formData.append(key, String(form[key])));

        setIsSaving(true);
        const { data, errors, error } = await updateCompany(axiosAuth, formData);
        setIsSaving(false);

        if (!data) {
            toast(error ?? Object.values(errors ?? {})[0] ?? 'No se pudo guardar', 'error');
            return;
        }

        const saved = pick({ ...form, ...data });
        setForm(saved);
        setSnapshot(saved);
        // Los permisos de la sesión son una foto del login: se refrescan para que apliquen sin re-loguear
        await update({ permissions: Object.fromEntries(SESSION_UPDATABLE_PERMISSIONS.map(key => [key, saved[key]])) });
        toast('Permisos actualizados');
    };

    if (!form) {
        return <p className="py-6 text-sm text-ink-3" role="status">Cargando…</p>;
    }

    return (
        <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {groups.map(group => (
                    <section key={group.title}>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">{group.title}</p>
                        {group.items.map(item => (
                            <Switch key={item.name} name={item.name} label={item.label} checked={form[item.name]} onChange={handleChange} />
                        ))}
                    </section>
                ))}
            </div>
            <div className="flex justify-end mt-6">
                <div className="w-28">
                    <PrimaryButton label="Guardar" type="button" action="store" onClick={submit} isLoading={isSaving} disabled={!isDirty || isSaving} />
                </div>
            </div>
        </div>
    );
};
