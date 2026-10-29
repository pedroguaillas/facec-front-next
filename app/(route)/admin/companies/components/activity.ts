import { Company, CompanyActivityStatus } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

export const daysSince = (date?: string | null) => date ? Math.floor((Date.now() - new Date(date).getTime()) / DAY) : null;

// Misma regla que el filtro del backend; se usa si la respuesta no trae activity_status
export const activityStatusOf = (company: Company): CompanyActivityStatus => {
    if (company.activity_status) return company.activity_status;
    if (!company.first_voucher_at) return 'never';
    const days = daysSince(company.last_activity_at);
    if (days === null || days > 30) return 'inactive';
    const vouchers = (company.orders_30d ?? 0) + (company.shops_30d ?? 0);
    return days <= 7 && vouchers > 0 ? 'active' : 'risk';
};

export const activityLabels: Record<CompanyActivityStatus, string> = {
    active: 'Activo',
    risk: 'En riesgo',
    inactive: 'Inactivo',
    never: 'Nunca empezó',
};

export const activityStyles: Record<CompanyActivityStatus, string> = {
    active: 'bg-sri-ok-soft text-sri-ok',
    risk: 'bg-sri-wait-soft text-sri-wait',
    inactive: 'bg-sri-fail-soft text-sri-fail',
    never: 'bg-surface-sunken text-ink-3',
};

// "hoy", "ayer", "hace 5 días", "hace 3 meses"
export const relativeDays = (date?: string | null) => {
    const days = daysSince(date);
    if (days === null) return 'Nunca';
    if (days <= 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 60) return `Hace ${days} días`;
    return `Hace ${Math.floor(days / 30)} meses`;
};
