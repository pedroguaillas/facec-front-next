import { fieldRepaymetNumbers, RepaymentTax } from "@/types";
import { FaTrash } from "react-icons/fa";

interface Props {
    indexRepayment: number;
    repaymentTaxes: RepaymentTax[];
    updateRepaymentTax: (index: number, taxIndex: number, attr: fieldRepaymetNumbers, value: string | number) => void;
    deleteRepaymentTax: (index: number, taxIndex: number) => void;
}

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors border-[var(--border-strong)]";
const selectBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors border-[var(--border-strong)]";

export const ItemRepaymentTaxes = ({ indexRepayment, repaymentTaxes, updateRepaymentTax, deleteRepaymentTax }: Props) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-[var(--background)]">
                        <th className="p-2 text-center border border-[var(--border)]">Impuesto</th>
                        <th className="p-2 text-right border border-[var(--border)]">Base Imp</th>
                        <th className="p-2 text-right border border-[var(--border)]">IVA</th>
                        <th className="p-2 text-right border border-[var(--border)]">Total</th>
                        <th className="p-2 w-10 border border-[var(--border)]"></th>
                    </tr>
                </thead>
                <tbody>
                    {repaymentTaxes.map((tax, taxIndex) => (
                        <tr key={taxIndex} className="hover:bg-primary/5 dark:hover:bg-primary/10">
                            <td className="p-1.5 border border-[var(--border)]">
                                <select
                                    value={tax.iva_tax_code}
                                    onChange={(e) => updateRepaymentTax(indexRepayment, taxIndex, 'iva_tax_code', e.target.value)}
                                    className={selectBase}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value={4}>IVA 15%</option>
                                    <option value={0}>IVA 0%</option>
                                </select>
                            </td>
                            <td className="p-1.5 border border-[var(--border)]">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tax.base}
                                    onChange={(e) => updateRepaymentTax(indexRepayment, taxIndex, 'base', e.target.value)}
                                    className={`${inputBase} text-right`}
                                    placeholder="0.00"
                                />
                            </td>
                            <td className="p-1.5 border border-[var(--border)]">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tax.iva}
                                    onChange={(e) => updateRepaymentTax(indexRepayment, taxIndex, 'iva', e.target.value)}
                                    className={`${inputBase} text-right`}
                                    placeholder="0.00"
                                />
                            </td>
                            <td className="p-1.5 border border-[var(--border)] text-right font-medium">
                                ${(Number(tax.base || 0) + Number(tax.iva || 0)).toFixed(2)}
                            </td>
                            <td className="p-1.5 border border-[var(--border)]">
                                <button
                                    onClick={() => deleteRepaymentTax(indexRepayment, taxIndex)}
                                    className="flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    {repaymentTaxes.length > 0 && (
                        <tr className="bg-[var(--background)] font-bold">
                            <td className="p-2 border text-center border-[var(--border)]" colSpan={1}>
                                TOTALES:
                            </td>
                            <td className="p-2 border border-[var(--border)] text-right">
                                ${repaymentTaxes.reduce((acc, tax) => acc + Number(tax.base || 0), 0).toFixed(2)}
                            </td>
                            <td className="p-2 border border-[var(--border)] text-right">
                                ${repaymentTaxes.reduce((acc, tax) => acc + Number(tax.iva || 0), 0).toFixed(2)}
                            </td>
                            <td className="p-2 border border-[var(--border)] text-right">
                                ${repaymentTaxes.reduce((acc, tax) => acc + Number(tax.base || 0) + Number(tax.iva || 0), 0).toFixed(2)}
                            </td>
                            <td className="p-2 border border-[var(--border)]"></td>
                        </tr>
                    )}
                </tfoot>
            </table>
        </div>
    )
}
