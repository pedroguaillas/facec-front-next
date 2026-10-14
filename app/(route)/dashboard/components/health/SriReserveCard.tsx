import { BusinessHealth } from "@/types";
import { getDate } from "@/helpers/dateHelper";
import { AmountRow, currency, Health, HealthCard, shortDate } from "./healthUi";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysUntil = (date: string) =>
    Math.round((Date.parse(date.slice(0, 10)) - Date.parse(getDate())) / DAY_MS);

const monthLabel = (date: string) =>
    new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('es-EC', { month: 'long', timeZone: 'UTC' });

// Para el SRI: el IVA que cobraste no es tuyo. Cuánto apartar y hasta cuándo declarar
export const SriReserveCard = ({ reserve }: { reserve: BusinessHealth['sri_reserve'] }) => {

    // RIMPE Negocio Popular no cobra IVA
    if (reserve.regime === 'rimpe_popular') {
        return (
            <HealthCard
                title="Para el SRI"
                status="info"
                statusLabel="Negocio Popular"
                tip={<>Igual conviene apartar cada mes una parte para la cuota anual.</>}
            >
                <p className="text-sm text-ink-2">
                    Como <strong className="text-ink-1">RIMPE Negocio Popular</strong> no cobras IVA en tus ventas. Pagas una cuota fija al año.
                </p>
            </HealthCard>
        );
    }

    const estimated = reserve.estimated ?? 0;
    const rent = reserve.rent_retained ?? 0;
    const days = reserve.due_date ? daysUntil(reserve.due_date) : null;
    const noPurchases = (reserve.purchases_count ?? 0) === 0;

    const status: Health = estimated + rent === 0 ? 'ok' : days !== null && days <= 5 ? 'warn' : 'info';
    const statusLabel = { ok: 'Nada por apartar', warn: days !== null && days < 0 ? 'Fecha pasada' : `Declara en ${days} d`, info: 'Apartar', bad: '' }[status];

    const period = !reserve.period_from
        ? 'este período'
        : reserve.frequency === 'semiannual' && reserve.period_to
            ? `${monthLabel(reserve.period_from)} a ${monthLabel(reserve.period_to)}`
            : monthLabel(reserve.period_from);

    return (
        <HealthCard
            title="Para el SRI"
            status={status}
            statusLabel={statusLabel}
            tip={noPurchases
                ? <>Es un <strong className="text-ink-1">estimado</strong>: aún no registras compras en este período. Regístralas para descontar su IVA y pagar solo lo justo.</>
                : <>El IVA que cobras no es tuyo, es del SRI. Guárdalo aparte apenas cobras y la declaración no te tomará por sorpresa.</>}
        >
            <div>
                <p className="text-sm text-ink-3">Aparta de {period}</p>
                <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-ink-1">{currency(estimated)}</p>
                {reserve.due_date && (
                    <p className="text-sm text-ink-2 mt-0.5">Declara hasta el <span className="font-medium text-ink-1">{shortDate(reserve.due_date)}</span></p>
                )}
            </div>

            <dl className="space-y-1 text-sm">
                <AmountRow label="IVA que cobraste" value={reserve.iva_sales ?? 0} />
                <AmountRow label="IVA de tus compras" value={reserve.iva_purchases ?? 0} sign="−" />
                {(reserve.iva_withheld ?? 0) > 0 && <AmountRow label="Retenciones que te hicieron" value={reserve.iva_withheld ?? 0} sign="−" />}
                {(reserve.iva_retained ?? 0) > 0 && <AmountRow label="IVA que retuviste" value={reserve.iva_retained ?? 0} sign="+" />}
            </dl>

            {rent > 0 && (
                <p className="text-sm text-ink-2">
                    Además aparta <span className="font-mono tabular-nums font-medium text-ink-1">{currency(rent)}</span> de renta que retuviste a proveedores (formulario 103).
                </p>
            )}
        </HealthCard>
    );
};
