import { ProductTemplate } from "./product-template";

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
    // Unidad (ej. una moto) de un producto modelo con plantilla; null si no es unidad
    parent_product_id?: number | null,
    // Plantilla del producto: con parent_product_id null es un modelo (sus unidades se dan de alta al comprar)
    product_template_id?: number | null,
    // Características efectivas (vacío si el producto no usa plantilla)
    characteristics?: ProductCharacteristic[],
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
    // Plantilla de características (ej. Moto); null = sin plantilla
    product_template_id?: number | null,
    // Valores de los campos de nivel "modelo" de la plantilla: { marca: 'Honda', ano: '2026' }
    details?: Record<string, string>,
    // Si es una unidad de un modelo, el modelo
    parent_product_id?: number | null,
}

// Característica efectiva para mostrar (PDF, lookup, unidades)
interface ProductCharacteristic {
    label: string;
    value: string;
    in_sri: boolean;
    sort: number;
}

// Unidad de un modelo con plantilla (ej. una moto con su chasis y motor)
interface ProductUnit {
    id: number;
    parent_product_id: number;
    code: string;
    name: string;
    price1: number | string;
    stock: number | string | null;
    details: Record<string, string>;
    characteristics: ProductCharacteristic[];
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
    // Plantillas activas, con solo sus campos activos
    productTemplates?: ProductTemplate[];
}

interface ProductEditResponse extends ProductCreateResponse {
    product: Product;
    details?: Record<string, string>;
    characteristics?: ProductCharacteristic[];
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
