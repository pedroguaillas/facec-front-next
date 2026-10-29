import { states, PaymentType } from "./general";
import { MovementSourceType } from "./movement";
import { ProductCharacteristic, ProductPresentation } from "./product";

interface OrderProps {
    atts: {
        date: string;
        extra_detail: string | null;
        send_mail: boolean;
        serie: string;
        state: states;
        total: number;
        payment_type: PaymentType;
        paid: number | string;
        xml: string | null;
        // Proforma ya convertida: su factura (no anulada); null si aún no se convierte
        converted_invoice?: { id: number; serie: string; state: states } | null;
    }
    customer: {
        email: string | null;
        name: string;
    }
    id: number
}

interface VoucherType {
    id: number;
    slug: string;
    name: string;
    abbreviation: string;
}

interface OrderCreateProps {
    id?: string;
    date: string;
    payment_type: PaymentType;
    due_date?: string; // Requerido si payment_type = CREDITO (YYYY-MM-DD)
    source_type?: MovementSourceType; // Requerido si payment_type = CONTADO
    source_id?: number; // Requerido si payment_type = CONTADO
    receipt?: File | null; // Comprobante del cobro con banco (solo al crear): se sube aparte y va como receipt_id
    receipt_id?: number;
    receipt_number?: string;
    paid?: number; // Solo lectura: viene del backend al editar
    no_iva: number,
    base0: number,
    base5: number,
    base8: number,
    base12: number,
    base15: number,
    iva5: number,
    iva8: number,
    iva: number,
    iva15: number,
    ice: number,
    sub_total: number,
    discount: string | number,
    total: number,
    description: string | null,
    customer_id: number,
    received: number, //Ver
    doc_realeted: number, //Ver
    voucher_type_id: number,
    point_id?: number,
    pay_method: number,
    guia?: string;
    date_order?: string;
    serie_order?: string;
    reason?: string;
    plate?: string;
}

interface PayMethod {
    code: number;
    description: string;
}

interface AditionalInformation {
    id: string;
    name: string;
    description: string;
}

interface ProductOutput {
    id: string;
    product_id: number;
    aux_cod?: string | null;
    price: number | string;
    quantity: number | string;
    stock: number;
    discount: number | string;
    iva: undefined | number;
    total_iva: number | string;
    ice: undefined | number | string;
    percentage: number;
    name?: string;
    // Producto con IVA diferenciado: en feriado su 15% (code 4) pasa a 8% (code 8)
    differentiated_iva?: boolean;
    // Código principal del producto (placeholder del código propio en la recurrente). `code` en la línea es el código propio
    product_code?: string;
    // Solo factura recurrente: código y descripción propios de la línea (admiten marcadores)
    custom_code?: string;
    custom_description?: string;
    // Presentación de la línea (null = unidad base). quantity y price van en la presentación
    presentation_id?: number | null;
    // Copia del factor (viene al editar); 1 o vacío = unidad base
    conversion_factor?: number | string | null;
    // Solo UI: precio de la unidad base, para volver a "Unidad" desde una presentación
    unit_price?: number | string;
    // Solo UI: presentaciones del producto elegido (al editar no vienen y se piden aparte)
    presentations?: ProductPresentation[];
    // Solo UI (inventario): stock del producto al seleccionarlo, para avisar si la cantidad lo supera
    available_stock?: number | string | null;
    type_product?: number;
    // Compra de un modelo con campos por unidad (ej. moto): la línea da de alta una unidad nueva
    // con estos valores (chasis, motor). Solo UI: la plantilla del modelo
    unit_template_id?: number | null;
    unit?: Record<string, string>;
    // Código manual de la unidad (plantilla sin campo de código)
    unit_code?: string | null;
    // Línea con una unidad ya existente (product_id = la unidad): cantidad fija 1
    parent_product_id?: number | null;
    characteristics?: ProductCharacteristic[];
    code?: string;
    // Venta guardada (orders.edit): foto de las características al vender; null si no tiene
    details?: ProductCharacteristic[] | null;
    // Solo UI: línea cargada desde el XML de la compra (sus valores no se editan)
    xml?: XmlPurchaseLine;
}

// Detalle de la factura del proveedor (XML del SRI)
interface XmlPurchaseLine {
    code: string;
    aux_code: string;
    description: string;
    quantity: number;
    // Precio total sin impuestos + ICE: el costo de la línea (con ICE) para el kardex
    cost_total: number;
    // codigoPorcentaje y tarifa del IVA
    iva_code: number;
    iva_rate: number;
    // detallesAdicionales: nombre → valor (ej. CHASIS, MOTOR)
    additional: Record<string, string>;
    // Cómo se encontró el producto: código vinculado al proveedor, código propio o elegido a mano
    match: 'provider' | 'code' | 'manual' | null;
    // Al elegirlo a mano: guardar "código del proveedor → producto" para la próxima factura
    remember?: boolean;
}

type fields = 'quantity' | 'price' | 'discount' | 'total_iva' | 'ice';