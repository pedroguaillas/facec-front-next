import { DashboardChartItem } from "@/types";
import { getDate } from "@/helpers/dateHelper";

interface Props {
    income: DashboardChartItem[];
    expenses: DashboardChartItem[];
}

const currency = (value: number) =>
    value.toLocaleString("es-EC", { style: "currency", currency: "USD" });

// period del backend: YYYYMM
const periodOf = (offsetMonths: number) => {
    const [y, m] = getDate().split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1 + offsetMonths, 1));
    return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const monthName = (period: string, style: 'long' | 'short' = 'long') =>
    new Date(Date.UTC(Number(period.slice(0, 4)), Number(period.slice(4)) - 1, 15))
        .toLocaleDateString('es-EC', { month: style, timeZone: 'UTC' });

const totalFor = (items: DashboardChartItem[], period: string) =>
    items.find(item => item.period === period)?.total ?? 0;

// Lo que importa al abrir la app: cuánto se facturó este mes y cómo va frente al anterior
export const MonthSummary = ({ income, expenses }: Props) => {
    const current = periodOf(0);
    const previous = periodOf(-1);

    const invoiced = totalFor(income, current);
    const invoicedBefore = totalFor(income, previous);
    const spent = totalFor(expenses, current);
    const result = invoiced - spent;
    const delta = invoicedBefore > 0 ? ((invoiced - invoicedBefore) / invoicedBefore) * 100 : null;

    return (
        <section className="rounded-xl border border-line bg-surface p-5 lg:p-6 flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Resumen de {monthName(current)}
            </p>

            <div className="flex flex-col gap-1">
                <span className="text-sm text-ink-2">Facturado este mes</span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums text-ink-1">
                        {currency(invoiced)}
                    </span>
                    {delta !== null ? (
                        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${delta >= 0 ? 'bg-sri-ok-soft text-sri-ok' : 'bg-sri-fail-soft text-sri-fail'}`}>
                            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}% vs {monthName(previous, 'short')}
                        </span>
                    ) : (
                        <span className="text-xs text-ink-3">Sin ventas en {monthName(previous)}</span>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-line">
                <div>
                    <dt className="text-xs text-ink-3">Compras del mes</dt>
                    <dd className="mt-1 font-mono text-lg font-medium tabular-nums text-ink-1">{currency(spent)}</dd>
                </div>
                <div>
                    <dt className="text-xs text-ink-3">Resultado del mes</dt>
                    <dd className={`mt-1 font-mono text-lg font-medium tabular-nums ${result >= 0 ? 'text-sri-ok' : 'text-sri-fail'}`}>
                        {currency(result)}
                    </dd>
                </div>
            </dl>
        </section>
    );
};
