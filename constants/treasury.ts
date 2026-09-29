import {
    Bank, BankAccount, BankAccountType,
    CashRegister, CashRegisterStatus, CashRegisterType,
    DenominationKind, MovementStatus, MovementTransactionType, MovementType, PaymentMethod, PaymentType,
} from "@/types";

export const paymentTypeOptions: { label: string; value: PaymentType }[] = [
    { label: 'Contado', value: 'CONTADO' },
    { label: 'Crédito', value: 'CREDITO' },
    { label: 'Anticipo', value: 'ANTICIPO' },
];

// Plazo sugerido al marcar Crédito (el usuario lo puede cambiar).
export const DEFAULT_CREDIT_TERM_DAYS = 30;

export const bankAccountTypeOptions: { label: string; value: BankAccountType }[] = [
    { label: 'Ahorro', value: 'AHORRO' },
    { label: 'Corriente', value: 'CORRIENTE' },
];

export const cashRegisterTypeOptions: { label: string; value: CashRegisterType }[] = [
    { label: 'General', value: 'GENERAL' },
    { label: 'Chica', value: 'CHICA' },
    { label: 'Otro', value: 'OTRO' },
];

export const cashRegisterStatusLabels: Record<CashRegisterStatus, string> = {
    ABIERTA: 'Abierta',
    CERRADA: 'Cerrada',
};

export const paymentMethodOptions: { label: string; value: PaymentMethod }[] = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Depósito', value: 'DEPOSITO' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'Cheque', value: 'CHEQUE' },
];

export const movementTypeOptions: { label: string; value: MovementType }[] = [
    { label: 'Ingreso', value: 'INGRESO' },
    { label: 'Egreso', value: 'EGRESO' },
];

export const movementStatusLabels: Record<MovementStatus, string> = {
    PENDIENTE: 'Pendiente',
    COMPLETADO: 'Completado',
};

export const movementTransactionTypeLabels: Record<MovementTransactionType, string> = {
    DEPOSITO: 'Depósito',
    RETIRO: 'Retiro',
    TRANSFERENCIA: 'Transferencia',
    APERTURA_CAJA: 'Apertura de caja',
    CIERRE_CAJA: 'Cierre de caja',
    OTRO: 'Otro',
};

export const denominationTypeLabels: Record<DenominationKind, string> = {
    MONEDA: 'Moneda',
    BILLETE: 'Billete',
};

export const initialBank: Bank = {
    id: 0,
    name: '',
};

export const initialBankAccount: BankAccount = {
    id: 0,
    bank_id: '',
    account_number: '',
    type: 'AHORRO',
    balance: 0,
};

export const initialCashRegister: CashRegister = {
    id: 0,
    name: '',
    responsible_id: '',
    type: 'CHICA',
    status: 'CERRADA',
    active_session: null,
};
