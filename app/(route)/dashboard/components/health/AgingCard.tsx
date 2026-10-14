import Link from "next/link";
import { AgingBucket, BusinessHealth } from "@/types";
import { currency, Health, HealthCard } from "./healthUi";

// De más nuevo a más viejo: el color se calienta con la antigüedad
const BUCKETS: { key: AgingBucket; label: string; color: string }[] = [
    { key: 'current', label: 'Al día', color: 'bg-sri-ok' },
    { key: 'd1_30', label: '1–30 días', color: 'bg-sri-wait/50' },
    { key: 'd31_60', label: '31–60 días', color: 'bg-sri-wait' },
    { key: 'd61_90', label: '61–90 días', color: 'bg-sri-fail/60' },
    { key: 'd90_plus', label: 'Más de 90 días', color: 'bg-sri-fail' },
    { key: 'no_due', label: 'Sin fecha (saldo inicial)', color: 'bg-ink-4' },
];

// Te deben: cuánto y desde hace cuánto. Mientras más viejo, más difícil de cobrar
export const AgingCard = ({ aging }: { aging: BusinessHealth['aging'] }) => {
    const total = BUCKETS.reduce((sum, bucket) => sum + (aging.buckets[bucket.key] ?? 0), 0);
    const old = (aging.buckets.d61_90 ?? 0) + (aging.buckets.d90_plus ?? 0);
    const overdue = total - (aging.buckets.current ?? 0) - (aging.buckets.no_due ?? 0);
    const oldShare = total > 0 ? Math.round((old / total) * 100) : 0;
    const overdueShare = total > 0 ? overdue / total : 0;

    const status: Health = total === 0 ? 'ok' : oldShare >= 30 ? 'bad' : overdueShare >= 0.2 ? 'warn' : 'ok';
    const statusLabel = { ok: total === 0 ? 'Sin pendientes' : 'Al día', warn: 'Por cobrar', bad: 'Cobro atrasado', info: '' }[status];

    const tip = total === 0
        ? <>Cuando vendas a crédito verás aquí quién te debe y desde cuándo.</>
        : oldShare >= 30
            ? <>El <strong className="text-ink-1">{oldShare}%</strong> de lo que te deben tiene más de 60 días. Mientras más espera una deuda, más difícil es cobrarla: llama hoy a los primeros de la lista.</>
            : overdue > 0
                ? <>Tienes {currency(overdue)} vencido. Cobrar a tiempo es la forma más barata de tener dinero disponible.</>
                : <>Tus clientes pagan a tiempo. Sigue dando plazos que puedas controlar.</>;

    const visibleBuckets = BUCKETS.filter(bucket => (aging.buckets[bucket.key] ?? 0) > 0);

    return (
        <HealthCard title="Te deben" status={status} statusLabel={statusLabel} tip={tip}>
            <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-ink-1">{currency(total)}</p>

            {total > 0 && (
                <>
                    {/* Barra apilada por antigüedad */}
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
                        {visibleBuckets.map(bucket => (
                            <span key={bucket.key} className={bucket.color} style={{ width: `${(aging.buckets[bucket.key] / total) * 100}%` }} />
                        ))}
                    </div>
                    <dl className="space-y-1 text-sm">
                        {visibleBuckets.map(bucket => (
                            <div key={bucket.key} className="flex justify-between gap-4">
                                <dt className="inline-flex items-center gap-2 text-ink-2">
                                    <span className={`size-2 rounded-sm ${bucket.color}`} aria-hidden="true" />
                                    {bucket.label}
                                    <span className="text-ink-4 tabular-nums">· {aging.counts[bucket.key]}</span>
                                </dt>
                                <dd className="font-mono tabular-nums text-ink-1">{currency(aging.buckets[bucket.key])}</dd>
                            </div>
                        ))}
                    </dl>
                </>
            )}

            {aging.to_collect.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-1.5">A quién cobrar primero</p>
                    <ul className="divide-y divide-line">
                        {aging.to_collect.map(party => (
                            <li key={party.customer_id}>
                                <Link href={`/customers/${party.customer_id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-brand-ink">
                                    <span className="min-w-0 truncate text-ink-1">{party.name}</span>
                                    <span className="shrink-0 flex items-baseline gap-2">
                                        <span className="text-xs text-ink-3 tabular-nums">{party.days_overdue === null ? 'sin fecha' : `${party.days_overdue} d`}</span>
                                        <span className="font-mono tabular-nums text-ink-1">{currency(party.amount)}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </HealthCard>
    );
};
