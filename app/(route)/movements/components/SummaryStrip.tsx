import { ReactNode } from "react";
import { MovementSummary } from "@/types";
import { money } from "../../banks/shared/bankUi";

interface Props {
    summary: MovementSummary | null;
    monthLabel: string;
}

const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${money(Math.abs(value))}`;

const toneOf = (value: number) => (value > 0 ? 'text-sri-ok' : value < 0 ? 'text-sri-fail' : 'text-ink-1');

// Frase que conecta los tres bloques: negocio ± dueño/préstamos = caja
const narrative = (summary: MovementSummary) => {
    const { net, financing, cash_change } = summary;
    const parts: string[] = [`tu negocio ${net >= 0 ? 'dejó' : 'perdió'} ${money(Math.abs(net))}`];
    if (financing.owner_withdrawals > 0) parts.push(`retiraste ${money(financing.owner_withdrawals)}`);
    if (financing.owner_contributions > 0) parts.push(`aportaste ${money(financing.owner_contributions)}`);
    if (financing.loans_received > 0) parts.push(`recibiste ${money(financing.loans_received)} en préstamos`);
    if (financing.loan_payments > 0) parts.push(`pagaste ${money(financing.loan_payments)} de préstamos`);
    const cash = cash_change === 0
        ? 'tu caja y bancos quedaron igual'
        : `tu caja y bancos ${cash_change > 0 ? 'subieron' : 'bajaron'} ${money(Math.abs(cash_change))}`;
    return `${parts.join(', ')}: ${cash}.`;
};

// La lección según el caso: ganar no es lo mismo que tener más dinero
const lesson = (summary: MovementSummary) => {
    const { net, cash_change, financing } = summary;
    if (net > 0 && cash_change < 0) {
        return 'Tu negocio sí gana: el dinero bajó por lo que sacaste o pagaste de préstamos, no por la operación.';
    }
    if (net < 0 && cash_change >= 0) {
        return 'La caja no bajó porque entró dinero tuyo o prestado, pero el negocio está gastando más de lo que vende.';
    }
    if (net > 0 && financing.owner_withdrawals > net) {
        return 'Retiraste más de lo que dejó el negocio. Fíjate un retiro mensual menor a la ganancia.';
    }
    return null;
};

// Tres bloques: lo que dejó el negocio · dueño y préstamos · variación de caja y bancos
export const SummaryStrip = ({ summary, monthLabel }: Props) => {

    if (!summary) {
        return <section className="rounded-xl border border-line bg-surface p-5 text-sm text-ink-3">Calculando el resumen…</section>;
    }

    const { financing } = summary;
    const hasFinancing = financing.owner_contributions + financing.owner_withdrawals + financing.loans_received + financing.loan_payments > 0;
    const isEmpty = summary.income === 0 && summary.expense === 0 && !hasFinancing;
    const tip = isEmpty ? null : lesson(summary);
    const pending = summary.pending.income + summary.pending.expense;

    return (
        <section className="rounded-xl border border-line bg-surface">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
                <Block title="Lo que dejó tu negocio" value={summary.net}>
                    <Row label="Entró" value={summary.income} />
                    <Row label="Salió" value={-summary.expense} />
                </Block>

                <Block title="Dueño y préstamos" value={financing.net} muted={!hasFinancing}>
                    {hasFinancing ? (
                        <>
                            {financing.owner_contributions > 0 && <Row label="Aportaste" value={financing.owner_contributions} />}
                            {financing.owner_withdrawals > 0 && <Row label="Retiraste" value={-financing.owner_withdrawals} />}
                            {financing.loans_received > 0 && <Row label="Préstamos recibidos" value={financing.loans_received} />}
                            {financing.loan_payments > 0 && <Row label="Pagos de préstamo" value={-financing.loan_payments} />}
                        </>
                    ) : (
                        <p className="text-ink-3">Sin aportes, retiros ni préstamos.</p>
                    )}
                </Block>

                <Block title="Variación de caja y bancos" value={summary.cash_change}>
                    {/* La suma explícita enseña de dónde sale el cambio */}
                    <p className="text-ink-3 tabular-nums">
                        {signed(summary.net)} negocio {financing.net < 0 ? '−' : '+'} {money(Math.abs(financing.net))} dueño y préstamos
                    </p>
                </Block>
            </div>

            <div className="border-t border-line px-4 lg:px-5 py-3 text-sm text-ink-2 space-y-1">
                <p>{isEmpty ? `Sin entradas ni salidas en ${monthLabel}.` : `En ${monthLabel}, ${narrative(summary)}`}</p>
                {tip && <p className="font-medium text-ink-1">{tip}</p>}
                {summary.internal > 0 && (
                    <p className="text-ink-3">
                        Moviste {money(summary.internal)} entre tus cuentas y cajas. No es ingreso ni gasto: el dinero sigue siendo tuyo.
                    </p>
                )}
                {pending > 0 && (
                    <p className="text-ink-3">
                        Hay movimientos pendientes ({money(summary.pending.income)} por entrar, {money(summary.pending.expense)} por salir) que aún no cuentan.
                    </p>
                )}
            </div>
        </section>
    );
};

const Block = ({ title, value, muted, children }: { title: string; value: number; muted?: boolean; children: ReactNode }) => (
    <div className="px-4 lg:px-5 py-4 min-w-0">
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-3">{title}</h3>
        <p className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${muted ? 'text-ink-4' : toneOf(value)}`}>{signed(value)}</p>
        <div className="mt-2 space-y-0.5 text-sm">{children}</div>
    </div>
);

const Row = ({ label, value }: { label: string; value: number }) => (
    <p className="flex items-baseline justify-between gap-3">
        <span className="text-ink-2">{label}</span>
        <span className="tabular-nums text-ink-1">{signed(value)}</span>
    </p>
);
