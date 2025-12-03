import { useFormInvoice } from "../context/FormInvoiceContext";
import { initialRepayment, initialRepaymentTax } from "@/constants/initialValues";
import { fieldRepaymetStrings } from "@/types";
import { nanoid } from "nanoid";

export const useRepayments = () => {

    const { repayment, repayments, setRepayments } = useFormInvoice();

    const addItemRepayment = () => {
        setRepayments((prev) => ([
            ...prev, { ...initialRepayment, id: nanoid(), repaymentTaxes: [{ ...initialRepaymentTax, id: nanoid(), }] }]));
    };

    const updateItemRepayment = (index: number, attr: fieldRepaymetStrings, value: string) => {
        setRepayments(prev => {
            const newList = [...prev];

            // Crear el objeto actualizado
            const updatedItem = { ...newList[index], [attr]: value };
            newList[index] = updatedItem;

            // TODO Borrar error de validación si esta bien

            return newList;
        });
    }

    const deleteItemRepayment = (index: number) => {
        let repays = repayments;
        repays = repays.filter((_, indexRepayment) => indexRepayment !== index);
        setRepayments(repays);
    }

    return { repayment, addItemRepayment, updateItemRepayment, deleteItemRepayment }
}