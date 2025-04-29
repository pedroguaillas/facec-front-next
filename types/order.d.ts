import { states } from "./general";

interface OrderProps {
    atts: {
        date: string;
        extra_detail: string | null;
        send_mail: boolean;
        serie: string;
        state: states;
        total: number;
        voucher_type: 1, 4;
        xml: string | null;
    }
    customer: {
        email: string | null;
        name: string;
    }
    id: number
}

interface OrderCreateProps {
    serie: string;
    date: string;
    expiration_days: number; //Eliminar
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
    voucher_type: 1 | 4,
    pay_method: number,
    guia?: string;
    date_order?: string;
    serie_order?: string;
    rason?: string;
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
    price: number | string;
    quantity: number | string;
    stock: number;
    discount: number | string;
    iva: undefined | number;
    total_iva: number | string;
    ice: undefined | number | string;
    percentage: number;
}

interface ProductInput {
    id: number;
    code: number | null;
    name: string;
}

type fields = 'quantity' | 'price' | 'discount' | 'total_iva' | 'ice';