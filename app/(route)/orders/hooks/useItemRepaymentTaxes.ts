import { initialRepaymentTax } from "@/constants";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { nanoid } from "nanoid";
import { fieldRepaymetNumbers, Repayment } from "@/types";

export const useItemRepaymentTaxes = () => {
    const { setRepayments } = useFormInvoice();

    const addItemRepaymentTax = (indexRepayment: number) => {
        setRepayments((prev: Repayment[]) => {
            const newList = [...prev];
            newList[indexRepayment] = {
                ...newList[indexRepayment],
                repaymentTaxes: [
                    ...newList[indexRepayment].repaymentTaxes,
                    { ...initialRepaymentTax, id: nanoid() }
                ]
            };
            return newList;
        });
    }

    const updateItemRepaymentTax = (indexRepayment: number, taxIndex: number, attr: fieldRepaymetNumbers, value: string | number) => {
        if (value && Number(value) < 0) {
            return;
        }

        setRepayments((prev: Repayment[]) => {
            const newList = [...prev];
            // Copia profunda del objeto Repayment específico
            newList[indexRepayment] = {
                ...newList[indexRepayment],
                // Copia profunda del array repaymentTaxes
                repaymentTaxes: [...newList[indexRepayment].repaymentTaxes]
            };
            // Copia profunda del objeto RepaymentTax específico
            newList[indexRepayment].repaymentTaxes[taxIndex] = {
                ...newList[indexRepayment].repaymentTaxes[taxIndex],
                [attr]: value !== '' ? Number(value) : value
            };
            return newList;
        });
    }

    const deleteItemRepaymentTax = (indexRepayment: number, taxIndex: number) => {
        setRepayments((prev: Repayment[]) => {
            const newList = [...prev];
            newList[indexRepayment].repaymentTaxes.splice(taxIndex, 1);
            return newList;
        });
    }

    return {
        addItemRepaymentTax,
        updateItemRepaymentTax,
        deleteItemRepaymentTax,
    }
}
