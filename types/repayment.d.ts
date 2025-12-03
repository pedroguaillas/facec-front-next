export interface Repayment {
    id: string;
    // order_id: number;
    // type_id_prov: number;  // 01 - factura
    identification: string;
    // cod_country: number;   // 593 - Ecuador
    // type_prov: number;     // Calcular 01 Persona natural - 02 Persona juridica
    // type_document: number; // 01 - factura
    sequential: string;
    date: string;
    authorization: string;
    repaymentTaxes: RepaymentTax[];
}

interface RepaymentTax {
    id: string;
    iva_tax_code: '' | 0 | 4;
    base: number;
    iva: number;
}

type fieldRepaymetStrings = 'identification' | 'sequential' | 'date' | 'authorization';
type fieldRepaymetNumbers = 'iva_tax_code' | 'base' | 'iva';