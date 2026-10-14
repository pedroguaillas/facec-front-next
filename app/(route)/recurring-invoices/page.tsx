"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaChevronRight, FaMagnifyingGlass } from "react-icons/fa6";
import { Paginate, PrimaryButton, Title } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { usePlan } from "@/lib/hooks/usePlan";
import { recurringFrequencyLabels } from "@/constants";
import { shortDate, shortDateTime } from "@/helpers/recurrenceHelper";
import { getRecurringInvoices } from "./services/recurringInvoiceServices";
import { RecurringErrorBadge, RecurringStatusBadge } from "./components/RecurringStatusBadge";
import { Links, Meta, RecurringInvoice, RecurringStatus } from "@/types";

type StatusFilter = RecurringStatus | '';

const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'ACTIVA', label: 'Activas' },
    { value: 'PAUSADA', label: 'Pausadas' },
    { value: 'FINALIZADA', label: 'Finalizadas' },
];

const columns = "md:grid-cols-[minmax(0,1.6fr)_8rem_8rem_7rem_7rem_1rem]";

const RecurringInvoicesPage = () => {

    const axiosAuth = useAxiosAuth();
    const { status: sessionStatus } = useSession();
    const { canEmit } = usePlan();
    const [items, setItems] = useState<RecurringInvoice[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<StatusFilter>('');
    const [isLoading, setIsLoading] = useState(true);

    // Búsqueda con pausa: no consulta en cada tecla
    useEffect(() => {
        const timer = setTimeout(() => setQuery(search.trim()), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchItems = useCallback(async (pageUrl?: string) => {
        const params = new URLSearchParams({ paginate: '15' });
        if (query) params.set('search', query);
        if (status) params.set('status', status);
        setIsLoading(true);
        const { data } = await getRecurringInvoices(axiosAuth, pageUrl ?? `recurring-invoices?${params}`);
        setIsLoading(false);
        if (data) {
            setItems(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        }
    }, [axiosAuth, query, status]);

    useEffect(() => {
        if (sessionStatus === 'authenticated') fetchItems();
    }, [fetchItems, sessionStatus]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchItems(pageUrl);
    };

    const isFiltered = !!query || !!status;

    return (
        <div className="dark:text-gray-300">
            <Title
                title="Facturas recurrentes"
                subTitle="Facturas que el sistema emite solo cada período"
                actions={[{ label: "Programar factura", type: "link", url: "recurring-invoices/create", action: "add", disabled: !canEmit, title: canEmit ? 'Nueva factura recurrente' : 'Tu plan está vencido' }]}
            />

            <div className="md:mx-8 py-4 mt-4 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <label className="relative flex-1 min-w-56 max-w-sm">
                        <span className="sr-only">Buscar</span>
                        <FaMagnifyingGlass aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-4" />
                        <input
                            type="search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o cliente"
                            className="w-full rounded-lg border border-line-strong bg-surface pl-8 pr-3 py-2 text-sm text-ink-1 focus:outline-none focus:border-primary"
                        />
                    </label>
                    <div role="radiogroup" aria-label="Estado" className="flex rounded-lg border border-line-strong bg-surface p-0.5">
                        {statusFilters.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={status === option.value}
                                onClick={() => setStatus(option.value)}
                                className={`rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer ${status === option.value ? 'bg-surface-sunken font-medium text-ink-1' : 'text-ink-3 hover:text-ink-1'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && items.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-3">Cargando…</div>
                ) : items.length === 0 ? (
                    isFiltered ? (
                        <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-3">Ninguna factura recurrente coincide con el filtro.</div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center">
                            <p className="font-medium text-ink-1">Aún no programas facturas recurrentes</p>
                            <p className="mt-1 text-sm text-ink-3 max-w-md mx-auto">
                                Para cobros que se repiten (mensualidades, arriendos, servicios): armas la factura una vez y el sistema la emite sola cada período.
                            </p>
                            {canEmit && (
                                <div className="mx-auto mt-4 w-52">
                                    <PrimaryButton label="Programar factura" type="link" url="recurring-invoices/create" action="add" />
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <div className={`rounded-xl border border-line bg-surface overflow-hidden transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
                        <div className={`hidden md:grid ${columns} gap-4 px-5 py-2.5 border-b border-line bg-surface-sunken text-xs font-medium uppercase tracking-wide text-ink-3`}>
                            <span>Plantilla</span>
                            <span>Frecuencia</span>
                            <span>Próxima</span>
                            <span className="text-right">Subtotal</span>
                            <span>Estado</span>
                            <span />
                        </div>
                        <ul className="divide-y divide-line">
                            {items.map(item => (
                                <li key={item.id}>
                                    <Link
                                        href={`/recurring-invoices/${item.id}`}
                                        className={`group grid grid-cols-[minmax(0,1fr)_auto] ${columns} items-center gap-x-4 gap-y-1 px-4 md:px-5 py-3 hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none transition-colors`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block font-medium text-ink-1 truncate">{item.atts.name}</span>
                                            <span className="block text-sm text-ink-3 truncate">{item.customer?.name}</span>
                                        </span>
                                        <span className="md:hidden justify-self-end flex flex-col items-end gap-1">
                                            <RecurringStatusBadge status={item.atts.status} />
                                            {item.atts.last_error && <RecurringErrorBadge message={item.atts.last_error} />}
                                        </span>
                                        <span className="text-sm text-ink-2 col-span-2 md:col-span-1">
                                            {recurringFrequencyLabels[item.atts.frequency]}
                                            <span className="md:hidden text-ink-3">
                                                {item.atts.next_run_at && ` · próxima ${shortDate(item.atts.next_run_at)}`}
                                            </span>
                                        </span>
                                        <span className="hidden md:block text-sm tabular-nums text-ink-2">
                                            {item.atts.next_run_at ? shortDateTime(item.atts.next_run_at) : '—'}
                                        </span>
                                        <span className="hidden md:block text-right text-sm font-medium tabular-nums text-ink-1">
                                            ${Number(item.atts.subtotal ?? 0).toFixed(2)}
                                        </span>
                                        <span className="hidden md:flex flex-col items-start gap-1">
                                            <RecurringStatusBadge status={item.atts.status} />
                                            {item.atts.last_error && <RecurringErrorBadge message={item.atts.last_error} />}
                                        </span>
                                        <FaChevronRight aria-hidden="true" className="hidden md:block justify-self-end text-xs text-ink-4 group-hover:text-ink-2" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
            </div>
        </div>
    );
};

export default RecurringInvoicesPage;
