export type CashRegisterType = 'GENERAL' | 'CHICA' | 'OTRO';
export type CashRegisterStatus = 'ABIERTA' | 'CERRADA';
export type DenominationKind = 'BILLETE' | 'MONEDA';

export interface CashRegisterActiveSession {
    id: number;
    cash_register_id: number;
    opened_by: number | null;
    closed_by: number | null;
    opened_at: string;
    closed_at: string | null;
    initial_balance: number;
    current_balance: number;
    final_balance: number | null;
    status: CashRegisterStatus;
    created_at: string;
    updated_at: string;
}

export interface CashRegister {
    id: number;
    name: string;
    responsible_id: number | '';
    type: CashRegisterType;
    status: CashRegisterStatus;
    active_session: CashRegisterActiveSession | null;
}

export interface CashRegisterProps {
    id: number;
    atts: {
        name: string;
        type: CashRegisterType;
        status: CashRegisterStatus;
    };
    responsible: { id: number; name: string; email: string };
    active_session: CashRegisterSession | null;
}

export interface Denomination {
    id: number;
    atts: {
        value: number;
        type: DenominationKind;
    };
}

export interface DenominationCount {
    denomination_id: number;
    quantity: number;
}

export interface CashRegisterSessionDenomination {
    denomination_id: number;
    value: number;
    denomination_type: DenominationKind;
    quantity: number;
}

export interface CashRegisterSession {
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
    opening_denominations: CashRegisterSessionDenomination[];
    closing_denominations: CashRegisterSessionDenomination[];
}
