export interface CheckAvailabilityResponse {
    succes: boolean;
    user: { registered: boolean };
    email: { valid: boolean; registered: boolean };
}

// Dashboard del administrador central: datos agregados de todo el sistema
export interface AdminDashboardCompanyRef {
    id: number;
    ruc: string;
    company: string;
}

export interface AdminDashboard {
    // Cache de 5 min en el backend: momento en que se calcularon los datos
    generated_at: string;
    vouchers: {
        month: { authorized: number; pending: number; rejected: number };
        // Sin autorizar hace más de 24 h, creados en los últimos 30 días
        stuck: number;
        by_day: { date: string; authorized: number; rejected: number }[];
        top_errors: { message: string; count: number }[];
        stuck_companies: (AdminDashboardCompanyRef & { pending: number; oldest_at: string })[];
    };
    companies: {
        total: number;
        new_month: number;
        new_prev_month: number;
        by_month: { month: string; count: number }[];
        activity: { active: number; risk: number; inactive: number; never: number };
    };
    subscriptions: {
        by_plan: { plan: string; count: number }[];
        renewals: (AdminDashboardCompanyRef & { plan: string; ended_at: string; days_left: number })[];
        expired_recent: number;
        revenue_month: number | null;
    };
    signatures: {
        expired: number;
        expiring: (AdminDashboardCompanyRef & { sign_valid_to: string; days_left: number })[];
    };
}
