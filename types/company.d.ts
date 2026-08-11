export interface Company {
    id: string,
    ruc: string,
    company: string,
    economic_activity: string,
    accounting: boolean,
    micro_business: boolean,
    rimpe: number,
    retention_agent: number | null,
    phone: string | null,
    logo_dir: string | null,
    logo_url: string | null,
    cert_dir: string | null,
    has_cert: boolean,
    sign_valid_from: string | null,
    sign_valid_to: string | null,
    enviroment_type: number,
    active: boolean,
    active_voucher: boolean,
    decimal: number,
    expired: string | null,
    pay_method: number,
    base5: boolean,
    base8: boolean,
    tourism_from: string | null,
    tourism_to: string | null,
    ice: boolean,
    inventory: boolean,
    printf: boolean,
    guia_in_invoice: boolean,
    import_in_invoice: boolean,
    import_in_invoices: boolean,

    // Servicio de transporte:
    transport: boolean,
    repayment: boolean,

    created_at?: string,
    updated_at?: string,
    deleted_at?: string | null,
}

export interface SriCompanyLookupRegistered {
    succes: boolean;
    registered: true;
    company: Company;
}

export interface SriCompanyLookupNew {
    succes: boolean;
    registered: false;
    name: string;
}

export type SriCompanyLookup = SriCompanyLookupRegistered | SriCompanyLookupNew;
