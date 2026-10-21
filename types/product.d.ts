export interface ProductProps {
    id: number,
    aux_cod?: string | null,
    atts: {
        code: string,
        aux_cod?: string | null,
        type_product: number,
        name: string,
        price1: number,
        iva: number,
        ice: null,
        irbpnr: null,
        stock: number | string | null,
        min_stock?: number | string | null,
        // Factura al 8% en feriados (solo empresas con base8 y tarifa 15%)
        differentiated_iva?: boolean,
    },
    iva: {
        code: number,
        percentage: number,
    },
    // Presentaciones del producto (vienen en GET products)
    presentations?: ProductPresentation[],
}

interface Product {
    id: string,
    code: string,
    aux_cod?: string,
    type_product: number,
    name: string,
    unity_id?: number,
    iva: number,
    ice?: string,
    // Decimal: puede venir 12.5 o negativo. Con inventario solo se usa al crear (saldo inicial)
    stock?: number | string | null,
    min_stock?: number | string | null,
    price1: string | number,
    // Factura al 8% en feriados (solo empresas con base8 y tarifa 15%)
    differentiated_iva?: boolean,
}

interface SriCategory {
    code: string;
    type: string;
    description: string;
}

interface ProductCreateResponse {
    ivaTaxes: [];
    iceCataloges: [];
    sriCategories: SriCategory[];
    transport: boolean;
    // Empresa habilitada para IVA diferenciado (8% en feriados)
    base8?: boolean;
}

interface ProductEditResponse extends ProductCreateResponse {
    product: Product;
}
// Presentación de venta/compra (ej. "Cubeta x30"): quantity y price de la línea van en la presentación,
// el kardex mueve quantity × conversion_factor en unidad base
interface ProductPresentation {
    id: number;
    product_id?: number;
    name: string;
    code: string | null;
    // Hasta 6 decimales (ej. 0.083333)
    conversion_factor: number;
    // Solo viene en GET products/{id}/presentations; lookup trae solo activas y sin este campo
    active?: boolean;
    // Precio propio o, si no tiene, price1 × factor
    price: number;
}
