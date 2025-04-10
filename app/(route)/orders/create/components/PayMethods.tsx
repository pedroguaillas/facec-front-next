"use client";

import { SelectOption } from "@/components"
import { useCreateInvoice } from "../../context/InvoiceCreateContext";

export const PayMethods = () => {

    const { invoice, payMethods, setInvoice } = useCreateInvoice();

    const optionPayMethods = payMethods.map(pay => {
        return { value: pay.code, label: pay.description }
    });

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setInvoice((prevState) => ({ ...prevState, 'pay_method': Number(event.target.value) }))
    }

    return (
        <div className="w-full overflow-x-auto my-2">
            <SelectOption label="Forma de pago" options={optionPayMethods} selectedValue={invoice.pay_method} handleSelect={handleSelect} />
        </div>
    )
}
