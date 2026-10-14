"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, IconButton, Paginate, TableResponsive, Title } from "@/components";
import { deleteHoliday, getHolidays } from "./services/holidaysServices";
import { HolidayFormModal } from "./shared/HolidayFormModal";
import { formatPlanDate } from "@/helpers/subscriptionHelper";
import { getDate } from "@/helpers/dateHelper";
import { useToast } from "@/context/ToastContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Holiday, Links, Meta } from "@/types";

const statusOf = ({ starts_at, ends_at }: Holiday, today: string) => {
    if (ends_at.slice(0, 10) < today) {
        return { label: 'Pasado', className: 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300' };
    }
    if (starts_at.slice(0, 10) <= today) {
        return { label: 'Vigente', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    }
    return { label: 'Próximo', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' };
};

// Días del feriado (fechas inclusivas)
const daysOf = ({ starts_at, ends_at }: Holiday) =>
    Math.round((Date.parse(ends_at.slice(0, 10)) - Date.parse(starts_at.slice(0, 10))) / 86_400_000) + 1;

const PageAdminHolidays = () => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const [holidays, setHolidays] = useState<Holiday[] | null>(null);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [page, setPage] = useState(1);
    // 'new' = registrar; Holiday = editar
    const [editing, setEditing] = useState<Holiday | 'new' | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const today = getDate();

    const fetchHolidays = useCallback(async () => {
        const { data, error } = await getHolidays(axiosAuth, page);
        if (data) {
            setHolidays(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        } else if (error) {
            toast(error, 'error');
        }
    }, [axiosAuth, page, toast]);

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    const confirmDelete = async (accept: boolean) => {
        if (!accept || deleteId === null) return;
        const { error } = await deleteHoliday(axiosAuth, deleteId);
        setDeleteId(null);
        if (error) {
            toast(error, 'error');
            return;
        }
        toast('Feriado eliminado');
        fetchHolidays();
    };

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        setPage(parseInt(pageUrl?.match(/page=(\d+)/)?.[1] || '1'));
    };

    return (
        <div className="dark:text-gray-300">
            <Title
                title="Feriados"
                subTitle="IVA diferenciado 8% en servicios turísticos, para todas las empresas habilitadas"
                actions={[{ label: "Nuevo feriado", type: "button", action: "add", onClick: () => setEditing('new') }]}
            />
            <div className="md:mx-8 py-4">
                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="text-left">FERIADO</th>
                            <th>DESDE</th>
                            <th>HASTA</th>
                            <th className="text-right">DÍAS</th>
                            <th>ESTADO</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {holidays === null && (
                            <tr><td colSpan={6} className="py-6 opacity-60">Cargando…</td></tr>
                        )}
                        {holidays !== null && holidays.length === 0 && (
                            <tr><td colSpan={6} className="py-6 opacity-60">No hay feriados registrados.</td></tr>
                        )}
                        {holidays?.map((holiday) => {
                            const status = statusOf(holiday, today);
                            return (
                                <tr key={holiday.id}>
                                    <td className="text-left font-medium">{holiday.name}</td>
                                    <td className="tabular-nums">{formatPlanDate(holiday.starts_at)}</td>
                                    <td className="tabular-nums">{formatPlanDate(holiday.ends_at)}</td>
                                    <td className="text-right tabular-nums">{daysOf(holiday)}</td>
                                    <td>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>{status.label}</span>
                                    </td>
                                    <td className="w-1">
                                        <div className="flex gap-2">
                                            <IconButton type="button" action="edit" onClick={() => setEditing(holiday)} title="Editar" />
                                            <IconButton type="button" action="delete" onClick={() => setDeleteId(holiday.id)} title="Eliminar" />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </TableResponsive>
                <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
            </div>

            {editing !== null && (
                <HolidayFormModal
                    holiday={editing === 'new' ? undefined : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        fetchHolidays();
                    }}
                />
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmDelete}
                title="¿Eliminar este feriado?"
                sutTitle="Las ventas ya emitidas no cambian. Las nuevas ventas en esas fechas volverán a la tarifa normal."
            />
        </div>
    )
}

export default PageAdminHolidays;
