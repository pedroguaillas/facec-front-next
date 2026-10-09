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
        stock: null,
        // Factura al 8% en feriados (solo empresas con base8 y tarifa 15%)
        differentiated_iva?: boolean,
    },
    iva: {
        code: number,
        percentage: number,
    },
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
    stock?: number,
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