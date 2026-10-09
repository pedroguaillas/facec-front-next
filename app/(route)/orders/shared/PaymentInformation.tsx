"use client";

import { useEffect, useState } from "react";
import { SelectOption, SelectPaymentSource, TextInput } from "@/components";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { paymentTypeOptions, DEFAULT_CREDIT_TERM_DAYS } from "@/constants";
import { addDaysToDate, getDate } from "@/helpers/dateHelper";
import { getCustomerAdvances } from "@/services/accountLedgerServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { usePlan } from "@/lib/hooks/usePlan";
import { MovementSourceType, PaymentType } from "@/types";

export const PaymentInformation = () => {

    const axiosAuth = useAxiosAuth();
    const { canUseFinance } = usePlan();
    // Crédito y anticipo requieren el plan Financiero
    const paymentOptions = canUseFinance ? paymentTypeOptions : paymentTypeOptions.filter(option => option.value === 'CONTADO');
    const { invoice, formErrors, setInvoice, setFormErrors } = useFormInvoice();
    const [advancesAvailable, setAdvancesAvailable] = useState<number | null>(null);

    useEffect(() => {
        if (invoice.payment_type !== 'ANTICIPO' || !invoice.customer_id) {
            setAdvancesAvailable(null);
            return;
        }
        getCustomerAdvances(axiosAuth, invoice.customer_id).then(({ data }) => {
            if (data) setAdvancesAvailable(data.total_remaining);
        });
    }, [axiosAuth, invoice.payment_type, invoice.customer_id]);

    const handleSelectPaymentType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const payment_type = e.target.value as PaymentType;
        setInvoice(prev => ({
            ...prev,
            payment_type,
            source_type: undefined,
            source_id: undefined,
            due_date: payment_type !== 'CONTADO' ? addDaysToDate(prev.date, DEFAULT_CREDIT_TERM_DAYS) : undefined,
        }));
        setFormErrors(prev => ({ ...prev, payment_type: '', source_type: '', source_id: '', due_date: '' }));
    };

    const handleChangeDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoice(prev => ({ ...prev, due_date: e.target.value }));
        setFormErrors(prev => ({ ...prev, due_date: '' }));
    };

    const handleSelectSource = (source_type: MovementSourceType, source_id: number) => {
        setInvoice(prev => ({ ...prev, source_type, source_id }));
        setFormErrors(prev => ({ ...prev, source_type: '', source_id: '' }));
    };

    // Forma de pago y origen (caja/banco) solo con plan Financiero o Gratuito
    if (!canUseFinance) return null;

    return (
        <div className="w-full min-w-0">
            <SelectOption
                label="Condición de pago"
                name="payment_type"
                options={paymentOptions}
                selectedValue={invoice.payment_type}
                error={formErrors.payment_type}
                handleSelect={handleSelectPaymentType}
                required
            />

            {invoice.payment_type !== 'CONTADO' && (
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

            {invoice.payment_type === 'ANTICIPO' && (
                <p className="text-xs opacity-70 -mt-1 mb-2">
                    {advancesAvailable !== null
                        ? `Anticipo disponible: $${advancesAvailable.toFixed(2)}. `
                        : ''}
                    Se aplica automático. Si no alcanza, el resto queda a crédito con el plazo indicado.
                </p>
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
