"use client";

import { useState } from "react";
import { FormModal, SegmentedControl, TextInput } from "@/components";
import { storeCompanySubscription } from "../services/companiesServices";
import { planOptions } from "@/constants/plans";
import { subscriptionSchema } from "@/schemas/company.schema";
import { addDaysToDate, getDate } from "@/helpers/dateHelper";
import { useFormSubmit } from "@/lib/hooks/useFormSubmit";
import { useToast } from "@/context/ToastContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { PlanCode } from "@/types";

interface Props {
    companyId: string;
    currentPlan?: PlanCode;
    onClose: () => void;
    onSaved: () => void;
}

// El plan gratuito es solo de prueba al crear la empresa: no se ofrece al cambiar/renovar
const paidPlanOptions = planOptions.filter(option => option.value !== 'GRATUITO');

// Cierra la suscripción vigente y abre una nueva (renovar o cambiar plan)
export const ChangePlanModal = ({ companyId, currentPlan, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const initialPlan: PlanCode = currentPlan && currentPlan !== 'GRATUITO' ? currentPlan : 'FACTURADOR';
    const [form, setForm] = useState<{ plan: PlanCode; ends_at: string; amount: string }>({ plan: initialPlan, ends_at: '', amount: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const selectedPlan = paidPlanOptions.find(option => option.value === form.plan);

    const { handleSubmit, isPending, message } = useFormSubmit<object>({
        schema: subscriptionSchema,
        data: form,
        setErrors,
        onSubmit: (data) => storeCompanySubscription(axiosAuth, companyId, data),
        onSuccess: () => {
            toast('Plan actualizado');
            onSaved();
        },
    });

    const setField = (field: 'ends_at' | 'amount', value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <FormModal
            title="Cambiar / renovar plan"
            subtitle="Se cerrará el plan vigente y se abrirá uno nuevo"
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isPending}
            isDirty={form.ends_at !== '' || form.amount !== '' || form.plan !== initialPlan}
            message={message}
        >
            <SegmentedControl
                label="Plan"
                name="plan"
                value={form.plan}
                options={paidPlanOptions}
                onChange={(plan) => {
                    setForm(prev => ({ ...prev, plan }));
                    setErrors({});
                }}
            />
            {selectedPlan && <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPlan.description}</p>}
            {errors.plan && <p className="text-xs text-red-500 mt-1">{errors.plan}</p>}

            <div className="sm:grid sm:grid-cols-2 sm:gap-4 mt-2">
                <TextInput
                    type="date"
                    label="Vence el"
                    name="ends_at"
                    value={form.ends_at}
                    error={errors.ends_at}
                    onChange={(e) => setField('ends_at', e.target.value)}
                    min={addDaysToDate(getDate(), 1)}
                    required
                />
                <TextInput
                    type="number"
                    label="Monto pagado"
                    name="amount"
                    value={form.amount}
                    error={errors.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    inputMode="decimal"
                    min="0"
                    placeholder="0.00"
                    required
                />
            </div>
        </FormModal>
    )
}
