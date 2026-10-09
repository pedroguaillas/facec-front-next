// Feriado nacional: en sus fechas los productos con IVA diferenciado facturan al 8%.
// Son globales (los registra el admin para todas las empresas).
export interface Holiday {
    id: number;
    name: string;
    starts_at: string; // YYYY-MM-DD
    ends_at: string; // YYYY-MM-DD (inclusivo)
}
