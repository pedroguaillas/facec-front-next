import { ProductOutput } from "@/types";

export interface InvoiceTotals {
    no_iva: number;
    base0: number;
    base5: number;
    base8: number;
    base12: number;
    base15: number;
    sub_total: number;
    ice: number;
    discount: number;
    iva5: number;
    iva8: number;
    iva: number;
    iva15: number;
    total: number;
}

// Fuente única de verdad: totales de la factura siempre derivados de los items actuales.
export const calculateInvoiceTotals = (productOutputs: ProductOutput[]): InvoiceTotals => {
    let no_iva = 0;
    let base0 = 0;
    let base5 = 0;
    let base8 = 0;
    let base12 = 0;
    let base15 = 0;
    let totalDiscount = 0;
    let totalIce = 0;

    productOutputs.forEach(({ quantity, price, discount, iva, total_iva, ice }) => {
        totalIce += ice !== undefined ? Number(ice) : 0
        totalDiscount += discount !== '' ? Number(discount) : 0
        if (iva !== undefined) {
            // IVA = 0% el total_iva = price * quantity - discount + 0 (0% IVA)
            no_iva += iva === 6 ? Number(total_iva) : 0;
            base0 += iva === 0 ? Number(total_iva) : 0;
            // IVA > 0% entonces total_iva = price * quantity - discount + Valor del IVA (5%-8%-12%-15%)
            base5 += iva === 5 ? Number(price) * Number(quantity) - Number(discount) : 0;
            base8 += iva === 8 ? Number(price) * Number(quantity) - Number(discount) : 0;
            base12 += iva === 2 ? Number(price) * Number(quantity) - Number(discount) : 0;
            base15 += iva === 4 ? Number(price) * Number(quantity) - Number(discount) : 0;
        }
    });

    const sub_total = no_iva + base0 + base5 + base8 + base12 + base15;

    const iva5 = Number((base5 * 0.05).toFixed(2));
    const iva8 = Number((base8 * 0.08).toFixed(2));
    const iva = base12 > 0 ? Number(((base12 + Number(totalIce)) * 0.12).toFixed(2)) : 0;
    const iva15 = base15 > 0 ? Number(((base15 + Number(totalIce)) * 0.15).toFixed(2)) : 0;
    const totalIva = Number((iva5 + iva8 + iva + iva15).toFixed(2));

    const total = sub_total + Number(totalIce) + totalIva;

    return {
        no_iva,
        base0,
        base5,
        base8,
        base12,
        base15,
        sub_total,
        ice: totalIce,
        discount: totalDiscount,
        iva5,
        iva8,
        iva,
        iva15,
        total,
    };
};
