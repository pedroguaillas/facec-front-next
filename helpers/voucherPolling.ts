const PENDING_STATES = ["CREADO", "FIRMADO", "ENVIADO", "RECIBIDA", "EN_PROCESO", "EN PROCESO"];

// Comprobantes sin flujo SRI (Nota de Venta, Proforma) no tienen nada "pendiente"
// en CREADO: no hay Procesar/Autorizar por delante, así que no aplica ni el
// spinner ni el polling. isElectronic=true preserva el comportamiento previo
// para los consumidores que no distinguen tipo de comprobante (shops, guías).
export const isPendingVoucherState = (state?: string | null, isElectronic: boolean = true): boolean =>
    isElectronic && !!state && PENDING_STATES.includes(state);
