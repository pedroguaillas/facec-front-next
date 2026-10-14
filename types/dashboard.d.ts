export interface DashboardChartItem {
    total: number;
    name: string;
    period: string;
}

export interface DashboardRecentOrder {
    id: number;
    serie: string;
    voucher_type: number;
    date: string;
    total: number;
    state: string;
    customer: { name: string };
}

interface SriCounts {
    pending: number;
    rejected: number;
}

export interface DashboardSri extends SriCounts {
    oldest_pending_date: string | null;
    // Inicio de la ventana contada (Y-m-d, hoy - 30 días)
    since?: string;
    // Desglose por tipo (las 4 claves vienen siempre). orders coincide con GET orders?state=
    by_type: {
        orders: SriCounts;
        shops: SriCounts;
        retentions: SriCounts;
        referralguides: SriCounts;
    };
}

export interface DashboardResponse {
    succes: boolean;
    active: boolean;
    expired: string | null;
    certExpiration: string | null;
    // true si la empresa ya subió su firma (.p12); certExpiration puede faltar en datos viejos
    hasCert?: boolean;
    income: DashboardChartItem[];
    expenses: DashboardChartItem[];
    counts: {
        orders: number;
        shops: number;
        customers: number;
        providers: number;
    };
    newThisMonth: {
        customers: number;
        providers: number;
    };
    recentOrders: DashboardRecentOrder[];
    sri?: DashboardSri;
}
