"use client";

import { SelectOption } from "@/components"
import { useFormInvoice } from "../context/FormInvoiceContext";
import { ORDER_VOUCHER_TYPE_SLUG } from "@/constants";

export const PayMethods = () => {

    const { invoice, formErrors, payMethods, voucherTypes, setInvoice } = useFormInvoice();

    // Solo se pide forma de pago en Factura (Nota de Crédito, Nota de Venta y Proforma no la piden)
    const selectedVoucherType = voucherTypes.find((vt) => vt.id === Number(invoice.voucher_type_id));
    if (selectedVoucherType?.slug !== ORDER_VOUCHER_TYPE_SLUG.FACTURA) return null;

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
