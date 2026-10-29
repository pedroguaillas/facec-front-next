// Plantilla de características por contribuyente (ej. Moto: Marca, Año, Chasis, Motor)
export type ProductTemplateFieldType = 'text' | 'number' | 'year';

// modelo: la comparte el producto padre (Marca, Año) · unidad: propia de cada unidad (Chasis, Motor)
export type ProductTemplateFieldLevel = 'modelo' | 'unidad';

export interface ProductTemplateField {
    id: number;
    product_template_id: number;
    key: string;
    label: string;
    type: ProductTemplateFieldType;
    level: ProductTemplateFieldLevel;
    required: boolean;
    unique: boolean;
    in_sri: boolean;
    sort: number;
    active: boolean;
}

export interface ProductTemplate {
    id: number;
    name: string;
    code_prefix: string | null;
    code_field_id: number | null;
    active: boolean;
    fields: ProductTemplateField[];
}

// Se envía siempre la lista completa de campos; los que no vienen se eliminan
export interface ProductTemplatePayload {
    name: string;
    code_prefix: string | null;
    code_field_key: string | null;
    active: boolean;
    fields: (Omit<ProductTemplateField, 'id' | 'product_template_id'> & { id?: number })[];
}
