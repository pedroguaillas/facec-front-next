"use client";

import { useEffect, useState } from "react";
import { SelectOption, SelectPaymentSource, TextInput } from "@/components";
import { useFormShop } from "../context/FormShopContext";
import { paymentTypeOptions, DEFAULT_CREDIT_TERM_DAYS } from "@/constants";
import { addDaysToDate, getDate } from "@/helpers/dateHelper";
import { getProviderAdvances } from "@/services/accountLedgerServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { MovementSourceType, PaymentType } from "@/types";

export const PaymentInformation = () => {

    const axiosAuth = useAxiosAuth();
    const { shop, errorShop, setShop, setErrorShop } = useFormShop();
    const [advancesAvailable, setAdvancesAvailable] = useState<number | null>(null);

    useEffect(() => {
        if (shop.payment_type !== 'ANTICIPO' || !shop.provider_id) {
            setAdvancesAvailable(null);
            return;
        }
        getProviderAdvances(axiosAuth, shop.provider_id).then(({ data }) => {
            if (data) setAdvancesAvailable(data.total_remaining);
        });
    }, [axiosAuth, shop.payment_type, shop.provider_id]);

    const handleSelectPaymentType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const payment_type = e.target.value as PaymentType;
        setShop(prev => ({
            ...prev,
            payment_type,
            source_type: undefined,
            source_id: undefined,
            due_date: payment_type !== 'CONTADO' ? addDaysToDate(prev.date, DEFAULT_CREDIT_TERM_DAYS) : undefined,
        }));
        setErrorShop(prev => ({ ...prev, payment_type: '', source_type: '', source_id: '', due_date: '' }));
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

            {shop.payment_type !== 'CONTADO' && (
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

            {shop.payment_type === 'ANTICIPO' && (
                <p className="text-xs opacity-70 -mt-1 mb-2">
                    {advancesAvailable !== null
                        ? `Anticipo disponible: $${advancesAvailable.toFixed(2)}. `
                        : ''}
                    Se aplica automático. Si no alcanza, el resto queda a crédito con el plazo indicado.
                </p>
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
