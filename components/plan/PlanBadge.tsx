import { planLabels } from "@/constants/plans";
import { PlanCode } from "@/types";

const planBadgeClasses: Record<PlanCode, string> = {
    GRATUITO: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    FACTURADOR: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    FINANCIERO: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

interface Props {
    plan: PlanCode;
    size?: 'xs' | 'sm';
}

export const PlanBadge = ({ plan, size = 'xs' }: Props) => (
    <span className={`inline-block px-2.5 py-0.5 rounded-full font-semibold ${size === 'sm' ? 'text-sm' : 'text-xs'} ${planBadgeClasses[plan]}`}>
        {planLabels[plan]}
    </span>
);
