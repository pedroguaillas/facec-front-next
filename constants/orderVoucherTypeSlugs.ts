// Slugs del voucherTypes que manda el backend en orders/create. Se usa el slug
// (no el id) para las reglas del formulario porque los ids pueden reordenarse
// en el backend; el slug es estable.
export const ORDER_VOUCHER_TYPE_SLUG = {
    FACTURA: 'venta_factura',
    NOTA_CREDITO: 'venta_nota_credito',
    NOTA_VENTA: 'venta_nota_venta',
    PROFORMA: 'venta_proforma',
} as const;

// El endpoint de lista (GET orders) NO manda voucher_type por fila — el único
// dato disponible ahí es el prefijo que el backend ya arma dentro de `serie`
// (ej. "FAC 001-001-000000001"). Se usa este prefijo, no un id, para evitar
// choques si en algún momento los ids del voucherTypes se reordenan.
export const ORDER_SERIE_PREFIX = {
    FACTURA: 'FAC',
    NOTA_CREDITO: 'N/C',
    NOTA_VENTA: 'N/V',
    PROFORMA: 'PRO',
} as const;
