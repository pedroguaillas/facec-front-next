// GET /dashboard/health — "Salud de tu negocio" (solo planes con cartera)
export type AgingBucket = 'current' | 'd1_30' | 'd31_60' | 'd61_90' | 'd90_plus' | 'no_due';

export interface CashflowWeek {
    from: string; // YYYY-MM-DD
    to: string;
    in: number;
    out: number;
}

export interface BusinessHealth {
    cashflow: {
        cash: number; // saldo hoy en bancos + cajas abiertas
        receivable: number; // te deben (vence en 30 días o ya vencido)
        payable: number; // debes (vence en 30 días o ya vencido)
        projected: number; // cash + receivable - payable
        weeks: CashflowWeek[];
    };
    aging: {
        buckets: Record<AgingBucket, number>;
        counts: Record<AgingBucket, number>;
        to_collect: {
            customer_id: number;
            name: string;
            amount: number;
            oldest_due_date: string | null;
            days_overdue: number | null; // null = solo saldo inicial sin fecha
        }[];
    };
    sri_reserve: {
        regime: 'general' | 'rimpe_emprendedor' | 'rimpe_popular';
        // rimpe_popular: todo en null salvo regime
        frequency: 'monthly' | 'semiannual' | null;
        period_from: string | null;
        period_to: string | null;
        iva_sales: number | null;
        iva_purchases: number | null;
        iva_withheld: number | null; // retenciones de IVA que te hicieron
        iva_retained: number | null; // IVA que retuviste a proveedores (se le debe al SRI)
        rent_retained: number | null; // renta retenida a proveedores (formulario 103)
        estimated: number | null;
        purchases_count: number | null;
        due_date: string | null;
    };
}
