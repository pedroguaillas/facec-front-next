interface Props {
    counts: { orders: number; shops: number; customers: number; providers: number };
    newThisMonth: { customers: number; providers: number };
}

// Totales históricos: contexto, no protagonistas
export const RecordsPanel = ({ counts, newThisMonth }: Props) => {
    const rows = [
        { label: 'Ventas emitidas', value: counts.orders },
        { label: 'Compras registradas', value: counts.shops },
        { label: 'Clientes', value: counts.customers, added: newThisMonth.customers },
        { label: 'Proveedores', value: counts.providers, added: newThisMonth.providers },
    ];

    return (
        <section className="rounded-xl border border-line bg-surface p-5 lg:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Registros</p>
            <dl className="mt-3 divide-y divide-line">
                {rows.map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-3 py-2.5">
                        <dt className="text-sm text-ink-2">{row.label}</dt>
                        <dd className="flex items-center gap-2">
                            {!!row.added && (
                                <span className="text-[11px] font-semibold rounded-full px-1.5 py-0.5 bg-brand-soft text-brand-ink">
                                    +{row.added} este mes
                                </span>
                            )}
                            <span className="font-mono text-sm font-medium tabular-nums text-ink-1">{row.value.toLocaleString('es-EC')}</span>
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};
