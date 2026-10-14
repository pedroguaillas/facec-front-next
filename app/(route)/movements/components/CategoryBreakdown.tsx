import { movementCategoryLabels } from "@/constants";
import { MovementSummary } from "@/types";
import { money } from "../../banks/shared/bankUi";

interface Props {
    summary: MovementSummary;
}

// "¿En qué se va tu dinero?": gastos del negocio por categoría; aparte, lo del dueño y préstamos
export const CategoryBreakdown = ({ summary }: Props) => {

    const expenses = summary.by_category.filter(it => it.group !== 'FINANCIAMIENTO' && it.type === 'EGRESO' && it.amount > 0);
    const financing = summary.by_category.filter(it => it.group === 'FINANCIAMIENTO' && it.amount > 0);
    const max = Math.max(...expenses.map(it => it.amount), 0);
    const unclassified = expenses.find(it => it.category === 'SIN_CLASIFICAR');
    const withdrawals = summary.financing.owner_withdrawals;
    // Qué parte de lo que dejó el negocio se llevó el dueño
    const ownerShare = summary.net > 0 ? Math.round((withdrawals / summary.net) * 100) : null;

    return (
        <section className="rounded-xl border border-line bg-surface p-4 lg:p-5">
            <h2 className="text-sm font-semibold text-ink-1">¿En qué gasta tu negocio?</h2>

            {expenses.length === 0 ? (
                <p className="mt-2 text-sm text-ink-3">Aún no hay gastos este mes.</p>
            ) : (
                <ul className="mt-3 space-y-2.5">
                    {expenses.map(item => (
                        <li key={item.category}>
                            <div className="flex items-baseline justify-between gap-3 text-sm">
                                <span className={item.category === 'SIN_CLASIFICAR' ? 'text-ink-3 italic' : 'text-ink-2'}>
                                    {movementCategoryLabels[item.category] ?? item.category}
                                    <span className="ml-1.5 text-xs text-ink-4 not-italic">{item.count}</span>
                                </span>
                                <span className="tabular-nums font-medium text-ink-1">{money(item.amount)}</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-surface-sunken overflow-hidden" aria-hidden="true">
                                <div
                                    className={`h-full rounded-full ${item.category === 'SIN_CLASIFICAR' ? 'bg-line-strong' : 'bg-brand-ink'}`}
                                    style={{ width: `${max ? (item.amount / max) * 100 : 0}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Dinero del dueño y préstamos: no es gasto del negocio, se muestra separado */}
            <div className="mt-4 pt-3 border-t border-line">
                <h3 className="text-xs font-medium uppercase tracking-wide text-ink-3">Dueño y préstamos</h3>
                {financing.length === 0 ? (
                    <p className="mt-1.5 text-sm text-ink-3">Sin movimientos este mes.</p>
                ) : (
                    <ul className="mt-1.5 space-y-1 text-sm">
                        {financing.map(item => (
                            <li key={item.category} className="flex items-baseline justify-between gap-3">
                                <span className="text-ink-2">{movementCategoryLabels[item.category] ?? item.category}</span>
                                <span className={`tabular-nums font-medium ${item.type === 'INGRESO' ? 'text-sri-ok' : 'text-ink-1'}`}>
                                    {item.type === 'INGRESO' ? '+' : '−'}{money(item.amount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Consejos según lo que muestran los datos */}
            <div className="mt-4 pt-3 border-t border-line space-y-2 text-sm text-ink-2">
                {withdrawals > 0 ? (
                    <p>
                        Retiraste <strong className="font-semibold text-ink-1">{money(withdrawals)}</strong> para ti
                        {ownerShare !== null && <> ({ownerShare}% de lo que dejó el negocio)</>}.
                        {' '}Asígnate un monto fijo al mes, menor a lo que deja el negocio.
                    </p>
                ) : (
                    <p>Si sacas dinero del negocio para gastos personales, clasifícalo como <em>Retiro del dueño</em>: no es un gasto del negocio y mezclarlo es el error más común.</p>
                )}
                {unclassified && (
                    <p className="text-ink-3">
                        {unclassified.count} {unclassified.count === 1 ? 'salida está' : 'salidas están'} sin clasificar. Clasifícalas en la lista para ver mejor en qué gastas.
                    </p>
                )}
            </div>
        </section>
    );
};
