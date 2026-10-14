import { ReactNode } from "react";

export const currency = (value: number) =>
    value.toLocaleString("es-EC", { style: "currency", currency: "USD" });

// YYYY-MM-DD → "12 nov"
export const shortDate = (date: string) =>
    new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export type Health = 'ok' | 'warn' | 'bad' | 'info';

const healthStyles: Record<Health, { dot: string; text: string }> = {
    ok: { dot: 'bg-sri-ok', text: 'text-sri-ok' },
    warn: { dot: 'bg-sri-wait', text: 'text-sri-wait' },
    bad: { dot: 'bg-sri-fail', text: 'text-sri-fail' },
    info: { dot: 'bg-brand-ink', text: 'text-brand-ink' },
};

interface CardProps {
    title: string;
    status: Health;
    statusLabel: string;
    children: ReactNode;
    // Qué significa y qué hacer: la parte "educativa" de cada indicador
    tip?: ReactNode;
}

// Tarjeta de indicador: título + semáforo, cifra y una frase de qué hacer
export const HealthCard = ({ title, status, statusLabel, children, tip }: CardProps) => (
    <section className="rounded-xl border border-line bg-surface p-5 lg:p-6 flex flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{title}</h3>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${healthStyles[status].text}`}>
                <span className={`size-2 rounded-full ${healthStyles[status].dot}`} aria-hidden="true" />
                {statusLabel}
            </span>
        </header>
        {children}
        {tip && (
            <p className="mt-auto pt-3 border-t border-line text-sm text-ink-2">{tip}</p>
        )}
    </section>
);

// Fila etiqueta / monto para los desgloses
export const AmountRow = ({ label, value, sign, strong }: { label: string; value: number; sign?: '+' | '−'; strong?: boolean }) => (
    <div className="flex justify-between gap-4">
        <dt className={strong ? 'font-medium text-ink-1' : 'text-ink-2'}>{label}</dt>
        <dd className={`font-mono tabular-nums ${strong ? 'font-semibold text-ink-1' : 'text-ink-1'}`}>
            {sign && value > 0 ? `${sign} ` : ''}{currency(value)}
        </dd>
    </div>
);
