import { FaArrowRight } from "react-icons/fa6";
import { PLAN_FINANCIERO_URL } from "@/constants/plans";

// Reemplaza a "Cartera vencida" en el plan Facturador: invita a probar el plan Financiero
export const FinancieroUpsellCard = () => (
    <section className="rounded-xl border border-brand-ink/20 bg-brand-soft p-5 lg:p-6 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink">Plan Financiero</p>
        <h2 className="text-lg font-semibold tracking-tight leading-snug text-ink-1">
            Controla quién te debe y a quién le debes
        </h2>
        <ul className="text-sm text-ink-2 space-y-1">
            <li>Ventas y compras a crédito</li>
            <li>Anticipos y abonos</li>
            <li>Cuentas por cobrar y pagar</li>
        </ul>
        <a
            href={PLAN_FINANCIERO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryhover transition-colors"
        >
            Probar plan Financiero
            <FaArrowRight className="text-xs" />
        </a>
    </section>
);
