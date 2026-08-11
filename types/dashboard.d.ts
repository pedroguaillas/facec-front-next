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

export interface DashboardResponse {
    succes: boolean;
    active: boolean;
    expired: string | null;
    certExpiration: string | null;
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
}
