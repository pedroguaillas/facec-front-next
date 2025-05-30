"use client";

import { SelectOption } from "@/components"
import { useFormInvoice } from "../context/FormInvoiceContext";

export const PayMethods = () => {

    const { invoice, formErrors, payMethods, setInvoice } = useFormInvoice();

    // Si es Nota de Crédito no mostrar la fora de pago
    if (Number(invoice.voucher_type) === 4) return null;

    const optionPayMethods = payMethods.map(pay => {
        return { value: pay.code, label: pay.description }
    });

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setInvoice((prevState) => ({ ...prevState, 'pay_method': Number(event.target.value) }))
    }

    return (
        <div className="w-full overflow-x-auto sm:max-w-sm md:max-w-md lg:max-w-lg my-2">
            <SelectOption
                label="Forma de pago"
                name="pay_method"
                options={optionPayMethods}
                selectedValue={invoice.pay_method}
                error={formErrors.pay_method}
                handleSelect={handleSelect}
            />
        </div>
    )
}
