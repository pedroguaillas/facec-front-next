export type AccountLedgerEntryType = 'FACTURA' | 'NOTA_CREDITO' | 'RETENCION' | 'PAGO' | 'SALDO_INICIAL';

export interface AdvanceEntry {
    id: number;
    amount: number;
    applied_amount: number;
    remaining: number;
    date: string;
}

export interface AdvancesSummary {
    total_remaining: number;
    advances: AdvanceEntry[];
}

export interface AccountLedgerEntry {
    id: number;
    type: AccountLedgerEntryType;
    type_label: string;
    description: string;
    debe: number;
    haber: number;
    previous_balance: number;
    new_balance: number;
    date: string;
    order_id?: number;
    shop_id?: number;
}
