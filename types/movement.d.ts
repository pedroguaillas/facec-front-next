export type MovementType = 'INGRESO' | 'EGRESO';
export type MovementTransactionType = 'DEPOSITO' | 'RETIRO' | 'TRANSFERENCIA' | 'APERTURA_CAJA' | 'CIERRE_CAJA' | 'OTRO'
    | 'COBRO_VENTA' | 'PAGO_COMPRA' | 'SALDO_INICIAL' | 'ANTICIPO_CLIENTE' | 'ANTICIPO_PROVEEDOR';
export type MovementStatus = 'PENDIENTE' | 'COMPLETADO';
export type PaymentMethod = 'EFECTIVO' | 'DEPOSITO' | 'TRANSFERENCIA' | 'CHEQUE';
export type MovementSourceType = 'bank_account' | 'cash_register_session';

export type MovementCategory =
    // Ingresos
    | 'VENTAS' | 'OTROS_INGRESOS' | 'APORTE_DUENO' | 'PRESTAMO_RECIBIDO'
    // Egresos
    | 'COMPRAS' | 'SUELDOS' | 'IESS' | 'ARRIENDO' | 'SERVICIOS_BASICOS' | 'TRANSPORTE' | 'PUBLICIDAD'
    | 'COMISIONES_BANCARIAS' | 'IMPUESTOS' | 'OTROS_GASTOS' | 'RETIRO_DUENO' | 'PAGO_PRESTAMO';

// NEGOCIO: lo que genera o consume la operación. FINANCIAMIENTO: dinero del dueño y préstamos
export type MovementCategoryGroup = 'NEGOCIO' | 'FINANCIAMIENTO';

export interface MovementCategoryInfo {
    category: MovementCategory;
    type: MovementType;
    group: MovementCategoryGroup;
}

export interface MovementOrigin {
    type: 'order' | 'shop';
    id: number;
    number: string;
}

export interface MovementSummary {
    period: { from: string; to: string };
    // Solo del negocio: sin dinero del dueño, préstamos ni transferencias entre cuentas propias
    income: number;
    expense: number;
    net: number;
    financing: {
        owner_contributions: number;
        owner_withdrawals: number;
        loans_received: number;
        loan_payments: number;
        // aportes + préstamos recibidos − retiros − pagos de préstamo
        net: number;
    };
    // Cuánto variaron caja y bancos: net + financing.net
    cash_change: number;
    internal: number;
    owner_withdrawals: number;
    pending: { income: number; expense: number };
    by_category: { category: MovementCategory | 'SIN_CLASIFICAR'; type: MovementType; group: MovementCategoryGroup; amount: number; count: number }[];
    accounts: { type: 'bank_account' | 'cash_register'; id: number; name: string; balance: number }[];
}

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
        has_receipt?: boolean;
        category?: MovementCategory | null;
    };
    // Documento que generó el movimiento (venta o compra de contado, abonos)
    origin?: MovementOrigin | null;
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
