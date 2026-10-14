import { PaymentType } from "./order";

export type RecurringFrequency = 'SEMANAL' | 'MENSUAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

export type RecurringStatus = 'ACTIVA' | 'PAUSADA' | 'FINALIZADA';

// Origen del cobro de la plantilla: id de la cuenta o de la CAJA (no de la sesión)
export type RecurringSourceType = 'bank_account' | 'cash_register';

export interface RecurringInvoiceItem {
    id: number;
    product_id: number;
    product_code: string;
    name: string;
    // Propios de la plantilla (pueden traer marcadores); null = los del producto
    code: string | null;
    description: string | null;
    quantity: number | string;
    price: number | string;
    discount: number | string;
    iva: number;
}

export interface RecurringInvoice {
    id: number;
    atts: {
        name: string;
        frequency: RecurringFrequency;
        // "Y-m-d H:i": cada factura sale a esa hora
        start_at: string;
        end_date: string | null;
        max_occurrences: number | null;
        next_run_at: string | null;
        status: RecurringStatus;
        auto_send: boolean;
        payment_type: Extract<PaymentType, 'CONTADO' | 'CREDITO'>;
        due_days: number | null;
        pay_method: number | null;
        source_type: RecurringSourceType | null;
        source_id: number | null;
        emision_point_id: number | null;
        description: string | null;
        aditionals: { name: string; description: string }[] | null;
        emitted_count: number;
        last_run_at: string | null;
        last_error: string | null;
        // Sin IVA
        subtotal: number | string;
    };
    customer: {
        id: number;
        name: string;
        identication: string;
        email: string | null;
    };
    items?: RecurringInvoiceItem[];
    runs?: RecurringInvoiceRun[];
}

export interface RecurringInvoiceRun {
    id: number;
    period_date: string;
    status: 'EMITIDA' | 'ERROR';
    message: string | null;
    attempts: number;
    order: { id: number; serie: string; state: string } | null;
    updated_at: string;
}

export interface RecurringInvoiceForm {
    name: string;
    emision_point_id: number | '';
    frequency: RecurringFrequency;
    // datetime-local: "YYYY-MM-DDTHH:mm"
    start_at: string;
    end_date: string;
    max_occurrences: string;
    auto_send: boolean;
    payment_type: 'CONTADO' | 'CREDITO';
    due_days: string;
    pay_method: number;
    source_type: RecurringSourceType | '';
    source_id: number | '';
    description: string;
}

export interface RecurringEmitResponse {
    succes: boolean;
    order: { id: number; serie: string };
    recurring_invoice: RecurringInvoice;
}
