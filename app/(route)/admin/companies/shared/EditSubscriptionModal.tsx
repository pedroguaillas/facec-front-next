"use client";

import { useState } from "react";
import { FormModal, SegmentedControl, TextInput } from "@/components";
import { updateCompanySubscription } from "../services/companiesServices";
import { planOptions } from "@/constants/plans";
import { subscriptionEditSchema } from "@/schemas/company.schema";
import { useFormSubmit } from "@/lib/hooks/useFormSubmit";
import { useToast } from "@/context/ToastContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { PlanCode, Subscription } from "@/types";

interface Props {
    companyId: string;
    subscription: Subscription;
    onClose: () => void;
    onSaved: () => void;
}

type Form = { plan: PlanCode; started_at: string; ended_at: string; amount: string };

// Corrige un registro del historial (fechas, plan o monto mal cargados)
export const EditSubscriptionModal = ({ companyId, subscription, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const [initialForm] = useState<Form>({
        plan: subscription.plan,
        started_at: subscription.started_at?.slice(0, 10) ?? '',
        ended_at: subscription.ended_at?.slice(0, 10) ?? '',
        amount: String(subscription.amount ?? 0),
    });
    const [form, setForm] = useState<Form>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const selectedPlan = planOptions.find(option => option.value === form.plan);

    const { handleSubmit, isPending, message } = useFormSubmit<object>({
        schema: subscriptionEditSchema,
        data: form,
        setErrors,
        onSubmit: (data) => updateCompanySubscription(axiosAuth, companyId, subscription.id, data),
        onSuccess: () => {
            toast('Suscripción actualizada');
            onSaved();
        },
    });

    const setField = (field: 'started_at' | 'ended_at' | 'amount', value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <FormModal
            title="Editar suscripción"
            subtitle="Corrige el registro sin crear uno nuevo"
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isPending}
            isDirty={JSON.stringify(form) !== JSON.stringify(initialForm)}
            message={message}
        >
            <SegmentedControl
                label="Plan"
                name="plan"
                value={form.plan}
                options={planOptions}
                onChange={(plan) => {
                    setForm(prev => ({ ...prev, plan }));
                    setErrors(prev => ({ ...prev, plan: '' }));
                }}
            />
            {selectedPlan && <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPlan.description}</p>}
            {errors.plan && <p className="text-xs text-red-500 mt-1">{errors.plan}</p>}

            <div className="sm:grid sm:grid-cols-2 sm:gap-4 mt-2">
                <TextInput
                    type="date"
                    label="Desde"
                    name="started_at"
                    value={form.started_at}
                    error={errors.started_at}
                    onChange={(e) => setField('started_at', e.target.value)}
                    required
                />
                <TextInput
                    type="date"
                    label="Hasta"
                    name="ended_at"
                    value={form.ended_at}
                    error={errors.ended_at}
                    onChange={(e) => setField('ended_at', e.target.value)}
                    min={form.started_at || undefined}
                    required
                />
            </div>
            <TextInput
                type="text"
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
        </FormModal>
    )
}
