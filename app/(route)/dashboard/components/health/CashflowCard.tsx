import { BusinessHealth } from "@/types";
import { AmountRow, currency, Health, HealthCard, shortDate } from "./healthUi";

// Próximos 30 días: con cuánto quedarías si cobras y pagas lo que vence
export const CashflowCard = ({ cashflow }: { cashflow: BusinessHealth['cashflow'] }) => {
    const { cash, receivable, payable, projected, weeks } = cashflow;

    // Saldo semana a semana: detecta la primera semana en que el dinero no alcanza
    let running = cash;
    const timeline = weeks.map(week => {
        running += week.in - week.out;
        return { ...week, balance: running };
    });
    const shortWeek = timeline.find(week => week.balance < 0);
    const maxFlow = Math.max(1, ...weeks.flatMap(week => [week.in, week.out]));

    const status: Health = projected < 0 ? 'bad' : shortWeek ? 'warn' : 'ok';
    const statusLabel = { ok: 'Alcanza', warn: 'Atención', bad: 'Falta dinero', info: '' }[status];

    const tip = projected < 0
        ? <>En 30 días te faltarían <strong className="text-ink-1">{currency(-projected)}</strong>. Cobra lo vencido primero o negocia más plazo con tus proveedores.</>
        : shortWeek
            ? <>La semana del {shortDate(shortWeek.from)} tus pagos superan lo que tienes. Adelanta cobros o mueve un pago para no quedarte corto.</>
            : <>Lo que cobras cubre lo que pagas. Aprovecha para guardar una parte como reserva.</>;

    return (
        <HealthCard title="Próximos 30 días" status={status} statusLabel={statusLabel} tip={tip}>
            <div>
                <p className="text-sm text-ink-3">Quedarías con</p>
                <p className={`font-mono text-3xl font-semibold tracking-tight tabular-nums ${projected < 0 ? 'text-sri-fail' : 'text-ink-1'}`}>
                    {currency(projected)}
                </p>
            </div>

            <dl className="space-y-1 text-sm">
                <AmountRow label="Tienes hoy (caja y bancos)" value={cash} />
                <AmountRow label="Te deben" value={receivable} sign="+" />
                <AmountRow label="Debes" value={payable} sign="−" />
            </dl>

            {timeline.length > 0 && (
                <div>
                    <div className="flex items-end gap-3 h-16" aria-hidden="true">
                        {timeline.map(week => (
                            <div key={week.from} className="flex-1 flex items-end justify-center gap-1 h-full">
                                <span className="w-2.5 rounded-t bg-sri-ok/70" style={{ height: `${Math.max(4, (week.in / maxFlow) * 100)}%` }} />
                                <span className="w-2.5 rounded-t bg-sri-fail/60" style={{ height: `${Math.max(4, (week.out / maxFlow) * 100)}%` }} />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-1">
                        {timeline.map(week => (
                            <span key={week.from} className={`flex-1 text-center text-[11px] tabular-nums ${week.balance < 0 ? 'text-sri-fail font-semibold' : 'text-ink-3'}`}>
                                {shortDate(week.from)}
                            </span>
                        ))}
                    </div>
                    <p className="sr-only">
                        {timeline.map(week => `Semana del ${shortDate(week.from)}: entra ${currency(week.in)}, sale ${currency(week.out)}, saldo ${currency(week.balance)}.`).join(' ')}
                    </p>
                    <p className="mt-2 flex gap-4 text-xs text-ink-3">
                        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-sri-ok/70" />Cobras</span>
                        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-sri-fail/60" />Pagas</span>
                    </p>
                </div>
            )}
        </HealthCard>
    );
};
