export interface Company {
    id: string,
    ruc: string,
    company: string,
    accounting: boolean,
    rimpe: number,
    retention_agent: number,
    sign_valid_to: Date,
    pay_method: number,
    base5: boolean,
    base8: boolean,
    ice: boolean,
    inventory: boolean,
    printf: boolean,
    guia_in_invoice: boolean,
    import_in_invoice: boolean,
    import_in_invoices: boolean,

    // Servicio de transporte:
    transport: boolean,
    repayment: boolean,
}