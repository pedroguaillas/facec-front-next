export interface ReferralGuideProps {
    id: string,
    atts: {
        // Fecha de emisión (d-m-Y): al enviar al SRI pasa a ser la del día, puede diferir del traslado
        date: string,
        date_start: string,
        date_end: string,
        serie: string,
        state: string,
        xml: string,
        extra_detail: string,
    },
    customer: {
        name: string,
    },
    carrier: {
        name: string,
    }
}

interface ReferralGuideCreateProps {
    serie: string,
    date_start: string,
    date_end: string,
    carrier_id: number,
    customer_id: number,
    address_from: string;
    address_to: string;
    reason_transfer: string;
    branch_destiny?: string;
    customs_doc?: string;
    route?: string;
    serie_invoice?: string;
    date_invoice?: string;
    authorization_invoice?: string;
}