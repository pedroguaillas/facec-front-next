import {
    Bank, BankAccount, BankAccountType,
    CashRegister, CashRegisterStatus, CashRegisterType,
    DenominationKind, MovementCategory, MovementCategoryGroup, MovementStatus, MovementTransactionType, MovementType, PaymentMethod, PaymentType,
} from "@/types";

export const paymentTypeOptions: { label: string; value: PaymentType }[] = [
    { label: 'Contado', value: 'CONTADO' },
    { label: 'Crédito', value: 'CREDITO' },
    // Anticipo deshabilitado por ahora: solo contado y crédito
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
    COBRO_VENTA: 'Cobro de venta',
    PAGO_COMPRA: 'Pago de compra',
    SALDO_INICIAL: 'Saldo inicial',
    ANTICIPO_CLIENTE: 'Anticipo de cliente',
    ANTICIPO_PROVEEDOR: 'Anticipo a proveedor',
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
    uses_sessions: false,
    active_session: null,
};

export const movementCategoryLabels: Record<MovementCategory | 'SIN_CLASIFICAR', string> = {
    VENTAS: 'Ventas',
    OTROS_INGRESOS: 'Otros ingresos',
    APORTE_DUENO: 'Aporte del dueño',
    PRESTAMO_RECIBIDO: 'Préstamo recibido',
    COMPRAS: 'Compras',
    SUELDOS: 'Sueldos',
    IESS: 'IESS',
    ARRIENDO: 'Arriendo',
    SERVICIOS_BASICOS: 'Servicios básicos',
    TRANSPORTE: 'Transporte',
    PUBLICIDAD: 'Publicidad',
    COMISIONES_BANCARIAS: 'Comisiones bancarias',
    IMPUESTOS: 'Impuestos',
    OTROS_GASTOS: 'Otros gastos',
    RETIRO_DUENO: 'Retiro del dueño',
    PAGO_PRESTAMO: 'Pago de préstamo',
    SIN_CLASIFICAR: 'Sin clasificar',
};

// Ejemplos para que el usuario sepa dónde va cada gasto
export const movementCategoryHints: Partial<Record<MovementCategory, string>> = {
    SERVICIOS_BASICOS: 'luz, agua, internet, teléfono',
    TRANSPORTE: 'combustible, fletes',
    COMISIONES_BANCARIAS: 'transferencias, datafast',
    IMPUESTOS: 'SRI, municipio, patentes',
};

export const movementCategoryGroupLabels: Record<MovementCategoryGroup, string> = {
    NEGOCIO: 'Del negocio',
    FINANCIAMIENTO: 'Dueño y préstamos',
};

// Movimientos entre cajas/cuentas propias: no son ingreso ni gasto del negocio
export const INTERNAL_TRANSACTION_TYPES: MovementTransactionType[] = [
    'TRANSFERENCIA', 'DEPOSITO', 'RETIRO', 'APERTURA_CAJA', 'CIERRE_CAJA', 'SALDO_INICIAL',
];
