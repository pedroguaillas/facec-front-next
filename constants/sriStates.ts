// Estados del comprobante en el SRI tal como están en BD (EN_PROCESO con guion bajo, NO AUTORIZADO con espacio)
export const SRI_PENDING_STATES = ['CREADO', 'FIRMADO', 'ENVIADO', 'RECIBIDA', 'EN_PROCESO'];
export const SRI_REJECTED_STATES = ['DEVUELTA', 'NO AUTORIZADO'];

// Filtro ?state= de la lista de ventas
export const ordersStateUrl = (states: string[]) => `/orders?state=${encodeURIComponent(states.join(','))}`;

export const sriFilterLabel = (state: string | null) => {
    if (!state) return null;
    if (state === SRI_REJECTED_STATES.join(',')) return 'Rechazados por el SRI';
    if (state === SRI_PENDING_STATES.join(',')) return 'Pendientes de autorizar';
    return `Estado: ${state.replace(/,/g, ', ')}`;
};
