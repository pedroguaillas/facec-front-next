// Slugs del voucherTypes que manda el backend en shops/create. Se usa el slug
// (no el id) en el formulario porque los ids pueden reordenarse en el backend.
export const SHOP_VOUCHER_TYPE_SLUG = {
    FACTURA: 'compra_factura',
    NOTA_VENTA: 'compra_nota_venta',
    LIQUIDACION_COMPRA: 'compra_liquidacion_compra',
    NOTA_DEBITO: 'compra_nota_debito',
} as const;

// Ids reales del voucherTypes (backend), para el schema de validación que no
// tiene acceso a la lista dinámica del contexto.
export const SHOP_VOUCHER_TYPE_ID = {
    FACTURA: 5,
    NOTA_VENTA: 6,
    LIQUIDACION_COMPRA: 7,
    NOTA_DEBITO: 8,
} as const;

// El endpoint de lista (GET shops) no manda voucher_type confiable por fila —
// se usa el prefijo que el backend ya arma en `serie` (ej. "L/C 001-...").
export const SHOP_SERIE_PREFIX = {
    FACTURA: 'FAC',
    NOTA_VENTA: 'N/V',
    LIQUIDACION_COMPRA: 'L/C',
    NOTA_DEBITO: 'N/D',
} as const;
