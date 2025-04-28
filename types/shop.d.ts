import { states } from "./general"

interface ShopProps {
    id: number,
    atts: {
        date: string,
        voucher_type: number,
        serie: string,
        total: number | string,
        serie_retencion: string | null,
        state_retencion: states,
        xml_retention: string | null,
        send_mail_retention: boolean,
        extra_detail_retention: string | null,
        retention: number | null | string,
        state: string,
        xml: string | null,
        extra_detail: string | null
    },
    provider: {
        name: string,
        email: null
    }
}

interface ShopCreateProps {
    serie: string,
    date: string,
    authorization: string,
    expiration_days: number,
    voucher_type: number,
    no_iva: number,
    base0: number,
    base5: number,
    base12: number,
    base15: number,
    iva: number,
    iva5: number,
    iva15: number,
    sub_total: number,
    discount: number,
    ice: number,
    total: number,
    description: null,
    provider_id: number,

    // Retencion
    serie_retencion: string,
    date_retention: string,
}

interface TaxInput {
    code: string,
    conception: string,
    porcentage: number | null,
    type: "iva" | "renta";
}

interface Tax {
    id: string;
    code: '' | number,
    tax_code: string,
    base: string | number,
    porcentage: string | number | null,
    value: number,
    editable_porcentage: boolean,
}