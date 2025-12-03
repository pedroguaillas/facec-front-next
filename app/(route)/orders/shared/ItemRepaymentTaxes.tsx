import { fieldRepaymetNumbers, RepaymentTax } from "@/types";
import { FaTrash } from "react-icons/fa";

interface Props {
    indexRepayment: number;
    repaymentTaxes: RepaymentTax[];
    updateRepaymentTax: (index: number, taxIndex: number, attr: fieldRepaymetNumbers, value: string | number) => void;
    deleteRepaymentTax: (index: number, taxIndex: number) => void;
}

export const ItemRepaymentTaxes = ({ indexRepayment, repaymentTaxes, updateRepaymentTax, deleteRepaymentTax }: Props) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="p-2 text-center border border-gray-300 dark:border-gray-600">Impuesto</th>
                        <th className="p-2 text-right border border-gray-300 dark:border-gray-600">Base Imp</th>
                        <th className="p-2 text-right border border-gray-300 dark:border-gray-600">IVA</th>
                        <th className="p-2 text-right border border-gray-300 dark:border-gray-600">Total</th>
                        <th className="p-2 w-10 border border-gray-300 dark:border-gray-600"></th>
                    </tr>
                </thead>
                <tbody>
                    {repaymentTaxes.map((tax, taxIndex) => (
                        <tr key={taxIndex} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <td className="p-1 border border-gray-300 dark:border-gray-600">
                                <select
                                    value={tax.iva_tax_code}
                                    onChange={(e) => updateRepaymentTax(indexRepayment, taxIndex, 'iva_tax_code', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value={4}>IVA 15%</option>
                                    <option value={0}>IVA 0%</option>
                                </select>
                            </td>
                            <td className="p-1 border border-gray-300 dark:border-gray-600">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tax.base}
                                    onChange={(e) => updateRepaymentTax(indexRepayment, taxIndex, 'base', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-right text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900"
                                    placeholder="0.00"
                                />
                            </td>
                            <td className="p-1 border border-gray-300 dark:border-gray-600">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tax.iva}
                                    onChange={(e) => updateRepaymentTax(indexRepayment, taxIndex, 'iva', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-right text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900"
                                    placeholder="0.00"
                                />
                            </td>
                            <td className="p-1 border border-gray-300 dark:border-gray-600 text-right font-medium">
                                ${(Number(tax.base || 0) + Number(tax.iva || 0)).toFixed(2)}
                            </td>
                            <td className="p-1 border border-gray-300 dark:border-gray-600">
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
                        <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                            <td className="p-2 border text-center border-gray-300 dark:border-gray-600" colSpan={1}>
                                TOTALES:
                            </td>
                            <td className="p-2 border border-gray-300 dark:border-gray-600 text-right">
                                ${repaymentTaxes.reduce((acc, tax) => acc + Number(tax.base || 0), 0).toFixed(2)}
                            </td>
                            <td className="p-2 border border-gray-300 dark:border-gray-600 text-right">
                                ${repaymentTaxes.reduce((acc, tax) => acc + Number(tax.iva || 0), 0).toFixed(2)}
                            </td>
                            <td className="p-2 border border-gray-300 dark:border-gray-600 text-right">
                                ${repaymentTaxes.reduce((acc, tax) => acc + Number(tax.base || 0) + Number(tax.iva || 0), 0).toFixed(2)}
                            </td>
                            <td className="p-2 border border-gray-300 dark:border-gray-600"></td>
                        </tr>
                    )}
                </tfoot>
            </table>
        </div>
    )
}
