"use client";

import { useState } from "react";
import { Dialog, FormModal, IconButton, TableResponsive, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useToast } from "@/context/ToastContext";
import { Warehouse } from "@/types";
import { InventoryShell } from "../components/InventoryShell";
import { useWarehouses } from "../hooks/useWarehouses";
import { deleteWarehouse, storeWarehouse, updateWarehouse } from "../services/inventoryServices";

const PageWarehouses = () => {
    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const { warehouses, isLoading, fetchWarehouses } = useWarehouses();
    // null = cerrado, { id: 0 } = nueva
    const [editing, setEditing] = useState<Pick<Warehouse, 'id' | 'name'> | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState<string>();
    const [message, setMessage] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const open = (warehouse: Pick<Warehouse, 'id' | 'name'>) => {
        setEditing(warehouse);
        setName(warehouse.name);
        setError(undefined);
        setMessage(undefined);
    };

    const submit = async () => {
        if (!editing) return;
        if (!name.trim()) {
            setError('Nombre requerido');
            return;
        }
        setIsPending(true);
        const form = { name: name.trim() };
        const response = editing.id ? await updateWarehouse(axiosAuth, editing.id, form) : await storeWarehouse(axiosAuth, form);
        setIsPending(false);

        if (response.data) {
            toast(editing.id ? 'Bodega actualizada' : 'Bodega creada');
            setEditing(null);
            fetchWarehouses();
            return;
        }
        if (response.errors) setError(response.errors.name ?? Object.values(response.errors)[0]);
        else setMessage(response.error);
    };

    const confirmDelete = async (accept: boolean) => {
        if (!accept || deleteId === null) return;
        const { data, error, errors } = await deleteWarehouse(axiosAuth, deleteId);
        setDeleteId(null);
        if (data) {
            toast(data.message || 'Bodega eliminada');
            fetchWarehouses();
        } else {
            toast(error ?? Object.values(errors ?? {})[0] ?? 'No se pudo eliminar la bodega', 'error');
        }
    };

    return (
        <InventoryShell
            title="Bodegas"
            subTitle="Bodegas de la sucursal"
            actions={[{ label: "Nueva bodega", type: "button", action: "add", onClick: () => open({ id: 0, name: '' }) }]}
        >
            <TableResponsive>
                <thead>
                    <tr>
                        <th className="text-left">NOMBRE</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {!isLoading && warehouses.length === 0 && (
                        <tr>
                            <td colSpan={2} className="py-8! text-ink-3">Se crea &quot;Bodega principal&quot; con el primer movimiento</td>
                        </tr>
                    )}
                    {warehouses.map((warehouse, index) => (
                        <tr key={warehouse.id}>
                            <td className="text-left">
                                {warehouse.name}
                                {index === 0 && (
                                    <span className="ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase bg-brand-soft text-brand-ink" title="Ventas y compras usan esta bodega">
                                        Por defecto
                                    </span>
                                )}
                            </td>
                            <td className="w-1">
                                <div className="flex gap-1">
                                    <IconButton type="button" action="edit" onClick={() => open(warehouse)} title="Renombrar" />
                                    {index > 0 && <IconButton type="button" action="delete" onClick={() => setDeleteId(warehouse.id)} title="Eliminar" />}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>

            {editing && (
                <FormModal
                    title={editing.id ? 'Renombrar bodega' : 'Nueva bodega'}
                    onClose={() => setEditing(null)}
                    onSubmit={submit}
                    isPending={isPending}
                    isDirty={name !== editing.name}
                    message={message}
                    modalSize="sm"
                >
                    <TextInput label="Nombre" name="name" value={name} error={error} maxLength={100} onChange={(e) => { setName(e.target.value); setError(undefined); }} required />
                </FormModal>
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmDelete}
                title="¿Eliminar esta bodega?"
                sutTitle="Solo se pueden eliminar bodegas sin movimientos."
            />
        </InventoryShell>
    );
};

export default PageWarehouses;
