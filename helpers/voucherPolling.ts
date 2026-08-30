const PENDING_STATES = ["CREADO", "FIRMADO", "ENVIADO", "RECIBIDA", "EN_PROCESO", "EN PROCESO"];

export const isPendingVoucherState = (state?: string | null): boolean =>
    !!state && PENDING_STATES.includes(state);
