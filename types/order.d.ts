interface OrderProps {
    atts: {
        date: string;
        extra_detail: string | null;
        send_mail: boolean;
        serie: string;
        state: 'CREADO' | 'FIRMADO' | 'ENVIADO' | 'RECIBIDA' | 'EN_PROCESO' | 'DEVUELTA' | 'AUTORIZADO' | 'NO AUTORIZADO' | 'ANULADO';
        total: number;
        voucher_type: 1, 4, 5;
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
    base12: number,
    base15: number,
    iva: number,
    ice: number,
    sub_total: number,
    discount: number,
    total: number,
    description: string | null,
    customer_id: number,
    received: number, //Ver
    doc_realeted: number, //Ver
    voucher_type: number,
    pay_method: number,
}

interface PayMethod {
    code: number;
    description: string;
}

interface EmisionPoint {
    id: number;
    store: string;
    point: string;
    recognition: string;
}