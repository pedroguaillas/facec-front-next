export type AccountLedgerEntryType = 'FACTURA' | 'NOTA_CREDITO' | 'RETENCION';

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
