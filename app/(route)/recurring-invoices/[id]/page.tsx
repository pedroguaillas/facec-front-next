"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaBolt, FaPause, FaPen, FaPlay, FaSpinner, FaTrash } from "react-icons/fa6";
import { Dialog, Modal, Notice, Title } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { usePlan } from "@/lib/hooks/usePlan";
import { useToast } from "@/context/ToastContext";
import { recurringFrequencyLabels } from "@/constants";
import { fillPlaceholders, shortDate, shortDateTime } from "@/helpers/recurrenceHelper";
import {
    deleteRecurringInvoice, emitRecurringInvoice, getRecurringInvoice, getRecurringInvoiceHistory,
    pauseRecurringInvoice, resumeRecurringInvoice,
} from "../services/recurringInvoiceServices";
import { RecurringStatusBadge } from "../components/RecurringStatusBadge";
import { RecurringInvoice, RecurringInvoiceRun } from "@/types";

type Busy = 'emit' | 'pause' | 'resume' | null;

const money = (value: number | string) => `$${Number(value).toFixed(2)}`;

const button = "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

const RecurringInvoiceDetailPage = () => {

    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const { canEmit } = usePlan();
    const { toast } = useToast();
    const [recurring, setRecurring] = useState<RecurringInvoice | null>(null);
    const [runs, setRuns] = useState<RecurringInvoiceRun[]>([]);
    const [allRuns, setAllRuns] = useState(false);
    const [notFound, setNotFound] = useState<string>();
    const [busy, setBusy] = useState<Busy>(null);
    const [confirmEmit, setConfirmEmit] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchRecurring = useCallback(async () => {
        const { data, error } = await getRecurringInvoice(axiosAuth, id);
        if (data) {
            setRecurring(data);
            setRuns(data.runs ?? []);
            setAllRuns(false);
        } else {
            setNotFound(error ?? 'No se encontró la plantilla');
        }
    }, [axiosAuth, id]);

    useEffect(() => {
        if (status === 'authenticated') fetchRecurring();
    }, [fetchRecurring, status]);

    if (!recurring) {
        return (
            <div className="dark:text-gray-300">
                <Title title="Factura recurrente" subTitle="Cargando…" actions={[{ label: "Regresar", type: "link", url: "/recurring-invoices", action: "back" }]} />
                <p className="md:mx-8 mt-8 rounded-xl border border-line bg-surface p-6 text-sm text-ink-3">{notFound ?? 'Cargando plantilla…'}</p>
            </div>
        );
    }

    const { atts, customer, items = [] } = recurring;
    const isActive = atts.status === 'ACTIVA';
    const isFinished = atts.status === 'FINALIZADA';

    const transition = async (kind: 'pause' | 'resume') => {
        setBusy(kind);
        const { data, error } = await (kind === 'pause' ? pauseRecurringInvoice : resumeRecurringInvoice)(axiosAuth, recurring.id);
        setBusy(null);
        if (data) {
            setRecurring(prev => prev && { ...data, items: data.items ?? prev.items });
            toast(kind === 'pause' ? 'Plantilla pausada: no se emitirá hasta que la reanudes' : 'Plantilla reanudada: sigue desde hoy');
        } else {
            toast(error ?? 'No se pudo cambiar el estado', 'error');
        }
    };

    const emit = async () => {
        setConfirmEmit(false);
        setBusy('emit');
        const { data, error, errors, code } = await emitRecurringInvoice(axiosAuth, recurring.id);
        setBusy(null);
        if (data) {
            toast(`Factura ${data.order.serie} emitida`);
            fetchRecurring();
        } else if (!code) {
            // 403 de plan: el aviso global ya se muestra (PlanErrorNotice)
            // Con inventario y sin stock: 422 con errors.products
            toast(error ?? errors?.products ?? Object.values(errors ?? {})[0] ?? 'No se pudo emitir', 'error');
        }
    };

    const handleDelete = async (accept: boolean) => {
        setDeleteId(null);
        if (!accept) return;
        const { error } = await deleteRecurringInvoice(axiosAuth, recurring.id);
        if (error) {
            toast(error, 'error');
            return;
        }
        toast('Plantilla eliminada');
        router.push('/recurring-invoices');
    };

    const loadAllRuns = async () => {
        const { data } = await getRecurringInvoiceHistory(axiosAuth, recurring.id, 200);
        if (data) {
            setRuns(data);
            setAllRuns(true);
        }
    };

    const ending = atts.end_date
        ? `Hasta el ${shortDate(atts.end_date)}`
        : atts.max_occurrences
            ? `${atts.max_occurrences} facturas`
            : 'Sin fecha de fin';
    const previewDate = atts.next_run_at ?? atts.start_at;
    const payment = atts.payment_type === 'CREDITO'
        ? `Crédito a ${atts.due_days ?? 0} días`
        : 'Contado';

    return (
        <div className="dark:text-gray-300">
            <Title
                title={atts.name}
                subTitle="Factura recurrente"
                actions={[{ label: "Regresar", type: "link", url: "/recurring-invoices", action: "back" }]}
            />

            <div className="md:mx-8 py-4 mt-4 flex flex-col gap-4">

                {atts.last_error && !isFinished && (
                    <Notice
                        tone="danger"
                        title="La última emisión falló"
                        action={canEmit && (
                            <button type="button" onClick={() => setConfirmEmit(true)} disabled={busy !== null} className={`${button} border border-sri-fail/40 text-sri-fail hover:bg-sri-fail/10`}>
                                Reintentar ahora
                            </button>
                        )}
                    >
                        {atts.last_error} Se reintenta sola cada hora.
                    </Notice>
                )}

                {/* Cabecera: cliente, programación y próxima emisión */}
                <section className="rounded-xl border border-line bg-surface">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 p-4 lg:p-5">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <RecurringStatusBadge status={atts.status} />
                                <span className="text-sm text-ink-2">{recurringFrequencyLabels[atts.frequency]}</span>
                                <span className="text-ink-4">·</span>
                                <span className="text-sm text-ink-3">{ending}</span>
                            </div>
                            <p className="mt-2 text-lg font-semibold text-ink-1 truncate">{customer.name}</p>
                            <p className="text-sm text-ink-3 tabular-nums">
                                {customer.identication}{customer.email && ` · ${customer.email}`}
                            </p>
                        </div>

                        <div className="lg:text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Próxima emisión</p>
                            <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums text-ink-1">
                                {atts.next_run_at && !isFinished ? shortDateTime(atts.next_run_at) : '—'}
                            </p>
                            <p className="text-xs text-ink-3">
                                {isActive ? (atts.auto_send ? 'Se autoriza y envía sola' : 'Queda en Ventas para revisar')
                                    : atts.status === 'PAUSADA' ? 'En pausa: no se emite' : 'Terminó su programación'}
                            </p>
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 md:grid-cols-4 border-t border-line divide-x divide-line text-sm">
                        <Stat label="Emitidas">
                            {atts.emitted_count}{atts.max_occurrences ? <span className="text-ink-3"> de {atts.max_occurrences}</span> : null}
                        </Stat>
                        <Stat label="Subtotal">{money(atts.subtotal ?? 0)} <span className="text-xs text-ink-3">+ IVA</span></Stat>
                        <Stat label="Cobro">{payment}</Stat>
                        <Stat label="Desde">{shortDateTime(atts.start_at)}</Stat>
                    </dl>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 border-t border-line bg-surface-sunken px-4 lg:px-5 py-3 rounded-b-xl">
                        {!isFinished && canEmit && (
                            <button type="button" onClick={() => setConfirmEmit(true)} disabled={busy !== null} className={`${button} bg-primary text-white hover:bg-primaryhover`}>
                                {busy === 'emit' ? <FaSpinner className="animate-spin" aria-hidden="true" /> : <FaBolt aria-hidden="true" />}
                                {busy === 'emit' ? 'Emitiendo…' : 'Emitir ahora'}
                            </button>
                        )}
                        {isActive && (
                            <button type="button" onClick={() => transition('pause')} disabled={busy !== null} className={`${button} border border-line-strong text-ink-2 hover:text-ink-1 hover:bg-surface`}>
                                {busy === 'pause' ? <FaSpinner className="animate-spin" aria-hidden="true" /> : <FaPause aria-hidden="true" />} Pausar
                            </button>
                        )}
                        {atts.status === 'PAUSADA' && (
                            <button type="button" onClick={() => transition('resume')} disabled={busy !== null} className={`${button} border border-line-strong text-ink-2 hover:text-ink-1 hover:bg-surface`}>
                                {busy === 'resume' ? <FaSpinner className="animate-spin" aria-hidden="true" /> : <FaPlay aria-hidden="true" />} Reanudar
                            </button>
                        )}
                        <Link href={`/recurring-invoices/${recurring.id}/edit`} className={`${button} border border-line-strong text-ink-2 hover:text-ink-1 hover:bg-surface`}>
                            <FaPen aria-hidden="true" /> Editar
                        </Link>
                        {atts.emitted_count === 0 && (
                            <button type="button" onClick={() => setDeleteId(recurring.id)} className={`${button} sm:ml-auto text-sri-fail hover:bg-sri-fail-soft`}>
                                <FaTrash aria-hidden="true" /> Eliminar
                            </button>
                        )}
                    </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
                    {/* Qué se factura */}
                    <section className="rounded-xl border border-line bg-surface p-4 lg:p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Detalle de cada factura</h2>
                        <ul className="mt-3 divide-y divide-line">
                            {items.map(item => (
                                <li key={item.id} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                                    <span className="min-w-0">
                                        <span className="block text-ink-1 truncate">
                                            {/* Texto propio de la línea con el mes de la próxima emisión */}
                                            {item.description ? fillPlaceholders(item.description, previewDate) : item.name}
                                        </span>
                                        {item.code && <span className="block font-mono text-xs text-ink-3">{fillPlaceholders(item.code, previewDate)}</span>}
                                        <span className="text-xs text-ink-3 tabular-nums">
                                            {Number(item.quantity)} × {money(item.price)}{Number(item.discount) > 0 && ` − ${money(item.discount)}`}
                                        </span>
                                    </span>
                                    <span className="tabular-nums font-medium text-ink-1">
                                        {money(Number(item.quantity) * Number(item.price) - Number(item.discount))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {atts.description && (
                            <p className="mt-3 pt-3 border-t border-line text-sm text-ink-2">
                                <span className="text-xs text-ink-3">Descripción: </span>{atts.description}
                            </p>
                        )}
                    </section>

                    {/* Historial de emisiones */}
                    <section className="rounded-xl border border-line bg-surface p-4 lg:p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Historial</h2>
                        {runs.length === 0 ? (
                            <p className="mt-3 text-sm text-ink-3">
                                Aún no emite facturas.{atts.next_run_at && !isFinished && ` La primera sale el ${shortDateTime(atts.next_run_at)}.`}
                            </p>
                        ) : (
                            <ul className="mt-3 divide-y divide-line">
                                {runs.map(run => (
                                    <li key={run.id} className="flex items-start gap-3 py-2.5 text-sm">
                                        <span
                                            aria-hidden="true"
                                            className={`mt-1.5 w-2 h-2 shrink-0 rounded-full ${run.status === 'EMITIDA' ? 'bg-sri-ok' : 'bg-sri-fail'}`}
                                        />
                                        <span className="flex-1 min-w-0">
                                            <span className="flex flex-wrap items-baseline gap-x-2">
                                                <span className="font-medium text-ink-1 tabular-nums">{shortDate(run.period_date)}</span>
                                                {run.order ? (
                                                    <Link href={`/orders/${run.order.id}`} className="font-mono text-xs text-primary hover:underline">{run.order.serie}</Link>
                                                ) : (
                                                    <span className="text-xs text-sri-fail">No se emitió</span>
                                                )}
                                                {run.order?.state && <span className="text-xs text-ink-3">{run.order.state}</span>}
                                            </span>
                                            {run.status === 'ERROR' && run.message && (
                                                <span className="block text-xs text-ink-3">
                                                    {run.message}{run.attempts > 1 && ` · ${run.attempts} intentos`}
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {!allRuns && runs.length >= 10 && (
                            <button type="button" onClick={loadAllRuns} className="mt-2 text-sm text-primary hover:underline cursor-pointer">
                                Ver todo el historial
                            </button>
                        )}
                    </section>
                </div>
            </div>

            <Modal isOpen={confirmEmit} onClose={() => setConfirmEmit(false)} modalSize="sm" title="Emitir ahora">
                <div className="flex flex-col gap-4 p-1">
                    <p className="text-sm text-ink-2">
                        {atts.last_error
                            ? 'Se vuelve a intentar la emisión que falló.'
                            : `Se emite ya la factura del ${atts.next_run_at ? shortDateTime(atts.next_run_at) : 'próximo período'} y la siguiente pasa al período que sigue.`}
                        {' '}{atts.auto_send ? 'Se envía al SRI y al cliente.' : 'Queda en Ventas sin procesar.'}
                    </p>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setConfirmEmit(false)} className={`${button} border border-line-strong text-ink-2 hover:text-ink-1`}>Cancelar</button>
                        <button type="button" onClick={emit} className={`${button} bg-primary text-white hover:bg-primaryhover`}>
                            <FaBolt aria-hidden="true" /> Emitir
                        </button>
                    </div>
                </div>
            </Modal>

            <Dialog
                itemId={deleteId}
                title="¿Eliminar esta plantilla?"
                sutTitle="Solo se puede eliminar si aún no emitió facturas."
                confirmation={handleDelete}
            />
        </div>
    );
};

const Stat = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="px-4 lg:px-5 py-3 [&:nth-child(3)]:border-l-0 md:[&:nth-child(3)]:border-l">
        <dt className="text-xs text-ink-3">{label}</dt>
        <dd className="mt-0.5 font-medium text-ink-1 tabular-nums">{children}</dd>
    </div>
);

export default RecurringInvoiceDetailPage;
