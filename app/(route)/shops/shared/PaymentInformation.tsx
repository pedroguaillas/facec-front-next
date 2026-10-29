"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PaymentReceiptInput, SelectOption, SelectPaymentSource, TextInput } from "@/components";
import { useFormShop } from "../context/FormShopContext";
import { paymentTypeOptions, DEFAULT_CREDIT_TERM_DAYS } from "@/constants";
import { addDaysToDate, getDate } from "@/helpers/dateHelper";
import { getProviderAdvances } from "@/services/accountLedgerServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { usePlan } from "@/lib/hooks/usePlan";
import { MovementSourceType, PaymentType } from "@/types";
import { FormSection } from "../../orders/shared/FormSection";

export const PaymentInformation = () => {

    const axiosAuth = useAxiosAuth();
    // Al editar ya no se crea el movimiento: el comprobante va solo al crear
    const params = useParams();
    const { canUseFinance } = usePlan();
    // Crédito y anticipo requieren el plan Financiero
    const { shop, errorShop, setShop, setErrorShop } = useFormShop();
    const baseOptions = canUseFinance ? paymentTypeOptions : paymentTypeOptions.filter(option => option.value === 'CONTADO');
    // Anticipo ya no se ofrece; solo se muestra al editar un documento que ya lo tenía
    const paymentOptions = shop.payment_type === 'ANTICIPO'
        ? [...baseOptions, { label: 'Anticipo', value: 'ANTICIPO' as const }]
        : baseOptions;
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
            receipt: null,
            receipt_number: undefined,
            due_date: payment_type !== 'CONTADO' ? addDaysToDate(prev.date, DEFAULT_CREDIT_TERM_DAYS) : undefined,
        }));
        setErrorShop(prev => ({ ...prev, payment_type: '', source_type: '', source_id: '', due_date: '' }));
    };

    const handleChangeDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShop(prev => ({ ...prev, due_date: e.target.value }));
        setErrorShop(prev => ({ ...prev, due_date: '' }));
    };

    const handleSelectSource = (source_type: MovementSourceType, source_id: number) => {
        // El comprobante solo va con cuenta bancaria
        setShop(prev => ({ ...prev, source_type, source_id, ...(source_type !== 'bank_account' && { receipt: null, receipt_number: undefined }) }));
        setErrorShop(prev => ({ ...prev, source_type: '', source_id: '' }));
    };

    // Forma de pago y origen (caja/banco) solo con plan Financiero o Gratuito
    if (!canUseFinance) return null;

    return (
        <FormSection title="Pago">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <SelectOption
                label="Condición de pago"
                name="payment_type"
                options={paymentOptions}
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
                <p className="col-span-full text-xs text-ink-3 -mt-1 mb-2">
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

            {shop.payment_type === 'CONTADO' && shop.source_type === 'bank_account' && !params?.id && (
                <div className="col-span-full">
                    <PaymentReceiptInput
                        number={shop.receipt_number ?? ''}
                        numberError={errorShop.receipt_number}
                        onNumberChange={(receipt_number) => {
                            setShop(prev => ({ ...prev, receipt_number }));
                            setErrorShop(prev => ({ ...prev, receipt_number: '' }));
                        }}
                        file={shop.receipt ?? null}
                        error={errorShop.receipt || errorShop.receipt_id}
                        onChange={(receipt) => {
                            setShop(prev => ({ ...prev, receipt }));
                            setErrorShop(prev => ({ ...prev, receipt: '', receipt_id: '' }));
                        }}
                    />
                </div>
            )}
        </div>
        </FormSection>
    )
}
