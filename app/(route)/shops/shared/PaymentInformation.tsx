"use client";

import { SelectOption, SelectPaymentSource, TextInput } from "@/components";
import { useFormShop } from "../context/FormShopContext";
import { paymentTypeOptions } from "@/constants";
import { getDate } from "@/helpers/dateHelper";
import { MovementSourceType, PaymentType } from "@/types";

export const PaymentInformation = () => {

    const { shop, errorShop, setShop, setErrorShop } = useFormShop();

    const handleSelectPaymentType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const payment_type = e.target.value as PaymentType;
        setShop(prev => ({ ...prev, payment_type, source_type: undefined, source_id: undefined }));
        setErrorShop(prev => ({ ...prev, payment_type: '', source_type: '', source_id: '' }));
    };

    const handleChangeDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShop(prev => ({ ...prev, due_date: e.target.value }));
        setErrorShop(prev => ({ ...prev, due_date: '' }));
    };

    const handleSelectSource = (source_type: MovementSourceType, source_id: number) => {
        setShop(prev => ({ ...prev, source_type, source_id }));
        setErrorShop(prev => ({ ...prev, source_type: '', source_id: '' }));
    };

    return (
        <div className="w-full overflow-x-auto sm:max-w-sm md:max-w-md lg:max-w-lg my-2">
            <SelectOption
                label="Forma de pago"
                name="payment_type"
                options={paymentTypeOptions}
                selectedValue={shop.payment_type}
                error={errorShop.payment_type}
                handleSelect={handleSelectPaymentType}
                required
            />

            {shop.payment_type === 'CREDITO' && (
                <TextInput
                    type="date"
                    label="Plazo"
                    name="due_date"
                    value={shop.due_date ?? ''}
                    error={errorShop.due_date}
                    onChange={handleChangeDueDate}
                    min={getDate()}
                    required
                />
            )}

            {shop.payment_type === 'CONTADO' && (
                <SelectPaymentSource
                    sourceType={shop.source_type ?? ''}
                    sourceId={shop.source_id ?? ''}
                    error={errorShop.source_type || errorShop.source_id}
                    onChange={handleSelectSource}
                />
            )}
        </div>
    )
}
