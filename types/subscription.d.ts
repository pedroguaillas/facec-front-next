export type PlanCode = 'GRATUITO' | 'FACTURADOR' | 'FINANCIERO';

export interface Subscription {
    id: number;
    company_id: number;
    plan: PlanCode;
    started_at: string;
    ended_at: string | null;
    // Monto pagado
    amount: number;
}

export interface CompanySubscriptions {
    company: { id: number; ruc: string; company: string };
    current: Subscription | null;
    // Más reciente primero
    history: Subscription[];
}

// Códigos del 403 por plan (campo `error` de la respuesta)
export type PlanErrorCode = 'subscription_expired' | 'plan_required';
