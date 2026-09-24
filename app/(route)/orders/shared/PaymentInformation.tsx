"use client";

import { SelectOption, SelectPaymentSource, TextInput } from "@/components";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { paymentTypeOptions } from "@/constants";
import { getDate } from "@/helpers/dateHelper";
import { MovementSourceType, PaymentType } from "@/types";

export const PaymentInformation = () => {

    const { invoice, formErrors, setInvoice, setFormErrors } = useFormInvoice();

    const handleSelectPaymentType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const payment_type = e.target.value as PaymentType;
        setInvoice(prev => ({ ...prev, payment_type, source_type: undefined, source_id: undefined }));
        setFormErrors(prev => ({ ...prev, payment_type: '', source_type: '', source_id: '' }));
    };

    const handleChangeDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoice(prev => ({ ...prev, due_date: e.target.value }));
        setFormErrors(prev => ({ ...prev, due_date: '' }));
    };

    const handleSelectSource = (source_type: MovementSourceType, source_id: number) => {
        setInvoice(prev => ({ ...prev, source_type, source_id }));
        setFormErrors(prev => ({ ...prev, source_type: '', source_id: '' }));
    };

    return (
        <div className="w-full overflow-x-auto sm:max-w-sm md:max-w-md lg:max-w-lg my-2">
            <SelectOption
                label="Forma de pago"
                name="payment_type"
                options={paymentTypeOptions}
                selectedValue={invoice.payment_type}
                error={formErrors.payment_type}
                handleSelect={handleSelectPaymentType}
                required
            />

            {invoice.payment_type === 'CREDITO' && (
                <TextInput
                    type="date"
                    label="Plazo"
                    name="due_date"
                    value={invoice.due_date ?? ''}
                    error={formErrors.due_date}
                    onChange={handleChangeDueDate}
                    min={getDate()}
                    required
                />
            )}

            {invoice.payment_type === 'CONTADO' && (
                <SelectPaymentSource
                    sourceType={invoice.source_type ?? ''}
                    sourceId={invoice.source_id ?? ''}
                    error={formErrors.source_type || formErrors.source_id}
                    onChange={handleSelectSource}
                />
            )}
        </div>
    )
}
