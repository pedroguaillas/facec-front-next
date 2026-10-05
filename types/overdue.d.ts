export interface OverdueDocument {
    order_id?: number;
    shop_id?: number;
    serie: string;
    due_date: string;
    days_overdue: number;
    pending: number;
}

export interface OverdueParty {
    customer_id?: number;
    customer_name?: string;
    provider_id?: number;
    provider_name?: string;
    total_overdue: number;
    documents: OverdueDocument[];
}

export interface OverdueSummary {
    total_overdue: number;
    parties: OverdueParty[];
}
