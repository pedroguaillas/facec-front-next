"use client";

import { SelectOption } from "@/components"
import { useCreateInvoice } from "../../context/InvoiceCreateContext";

export const PayMethods = () => {

    const { invoice, formErrors, payMethods, setInvoice } = useCreateInvoice();

    // Si es Nota de Crédito no mostrar la fora de pago
    if (invoice.voucher_type === 4) return null;

    const optionPayMethods = payMethods.map(pay => {
        return { value: pay.code, label: pay.description }
    });

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setInvoice((prevState) => ({ ...prevState, 'pay_method': Number(event.target.value) }))
    }

    return (
        <div className="w-full overflow-x-auto my-2">
            <SelectOption label="Forma de pago" name="pay_method" options={optionPayMethods} selectedValue={invoice.pay_method} error={formErrors.pay_method} handleSelect={handleSelect} />
        </div>
    )
}
