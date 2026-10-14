// Estados del comprobante en el SRI tal como están en BD (EN_PROCESO con guion bajo, NO AUTORIZADO con espacio)
export const SRI_PENDING_STATES = ['CREADO', 'FIRMADO', 'ENVIADO', 'RECIBIDA', 'EN_PROCESO'];
export const SRI_REJECTED_STATES = ['DEVUELTA', 'NO AUTORIZADO'];

// Días que cuenta el dashboard en "Comprobantes en el SRI"
export const SRI_WINDOW_DAYS = 30;

// Filtro ?state= (y ?date_from=) de la lista de ventas
export const ordersStateUrl = (states: string[], dateFrom?: string) =>
    `/orders?state=${encodeURIComponent(states.join(','))}${dateFrom ? `&date_from=${dateFrom}` : ''}`;

export const sriFilterLabel = (state: string | null, dateFrom?: string | null) => {
    if (!state) return null;
    const label = state === SRI_REJECTED_STATES.join(',') ? 'Rechazados por el SRI'
        : state === SRI_PENDING_STATES.join(',') ? 'Pendientes de autorizar'
        : `Estado: ${state.replace(/,/g, ', ')}`;
    if (!dateFrom) return label;
    const [y, m, d] = dateFrom.split('-');
    return `${label} · desde ${d}/${m}/${y}`;
};
