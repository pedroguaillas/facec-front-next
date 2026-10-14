import { BusinessHealth } from "@/types";
import { CashflowCard } from "./CashflowCard";
import { AgingCard } from "./AgingCard";
import { SriReserveCard } from "./SriReserveCard";

// Plan Financiero como educación financiera: tres preguntas que todo negocio debería poder responder
export const BusinessHealthSection = ({ health }: { health: BusinessHealth }) => (
    <section aria-labelledby="business-health-title" className="space-y-3">
        <div>
            <h2 id="business-health-title" className="text-lg font-semibold tracking-tight text-ink-1">Salud de tu negocio</h2>
            <p className="text-sm text-ink-3">¿Te alcanza el dinero?, ¿quién te debe? y ¿cuánto guardar para el SRI?</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
            <CashflowCard cashflow={health.cashflow} />
            <AgingCard aging={health.aging} />
            <SriReserveCard reserve={health.sri_reserve} />
        </div>
    </section>
);
