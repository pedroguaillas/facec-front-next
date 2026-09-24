export type MovementType = 'INGRESO' | 'EGRESO';
export type MovementTransactionType = 'DEPOSITO' | 'RETIRO' | 'TRANSFERENCIA' | 'APERTURA_CAJA' | 'CIERRE_CAJA' | 'OTRO';
export type MovementStatus = 'PENDIENTE' | 'COMPLETADO';
export type PaymentMethod = 'EFECTIVO' | 'DEPOSITO' | 'TRANSFERENCIA' | 'CHEQUE';
export type MovementSourceType = 'bank_account' | 'cash_register_session';

export interface MovementBankAccountParty {
    id: number;
    atts: {
        account_number: string;
        type: BankAccountType;
        balance: number;
    };
    bank?: { id: number; name?: string };
}

export interface MovementCashRegisterSessionParty {
    id: number;
    atts: {
        opened_at: string;
        closed_at: string | null;
        initial_balance: number;
        current_balance: number;
        final_balance: number | null;
        status: CashRegisterStatus;
    };
    cash_register_id: number;
    opened_by: number | null;
    closed_by: number | null;
}

export type MovementParty = MovementBankAccountParty | MovementCashRegisterSessionParty;

export interface Movement {
    id: number;
    atts: {
        date: string;
        type: MovementType;
        transaction_type: MovementTransactionType;
        amount: number;
        previous_balance: number;
        new_balance: number;
        status: MovementStatus;
        receipt_number?: string;
        payment_method: PaymentMethod;
        description?: string;
        receipt_path?: string | null;
    };
    source_type: MovementSourceType;
    source: MovementParty;
    destination_type: MovementSourceType | null;
    destination: MovementParty | null;
    user_id: number;
}

export interface MovementCommonFields {
    date?: string;
    payment_method?: PaymentMethod;
    receipt_number?: string;
    description?: string;
    receipt?: File | null;
}

export interface DepositPayload extends MovementCommonFields {
    cash_register_session_id: number;
    bank_account_id: number;
    amount: number;
}

export interface WithdrawPayload extends MovementCommonFields {
    bank_account_id: number;
    cash_register_session_id: number;
    amount: number;
}

export interface TransferPayload extends MovementCommonFields {
    origin_bank_account_id: number;
    destination_bank_account_id: number;
    amount: number;
}

export interface OtherMovementPayload extends MovementCommonFields {
    source_type: MovementSourceType;
    source_id: number;
    type: MovementType;
    amount: number;
}
