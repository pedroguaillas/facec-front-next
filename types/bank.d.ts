export type BankAccountType = 'AHORRO' | 'CORRIENTE';

export interface Bank {
    id: number;
    name: string;
}

export interface BankProps {
    id: number;
    atts: {
        name: string;
    };
}

export interface BankAccount {
    id: number;
    bank_id: number | '';
    account_number: string;
    type: BankAccountType;
    balance: number;
    opening_balance?: number | string; // Solo al crear
    bank?: Bank;
}

export interface BankAccountProps {
    id: number;
    atts: {
        account_number: string;
        type: BankAccountType;
        balance: number;
    };
    bank: Bank;
}
