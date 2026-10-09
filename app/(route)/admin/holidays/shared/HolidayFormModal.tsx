"use client";

import { useState } from "react";
import { FormModal, TextInput } from "@/components";
import { storeHoliday, updateHoliday } from "../services/holidaysServices";
import { holidaySchema } from "@/schemas/holiday.schema";
import { useFormSubmit } from "@/lib/hooks/useFormSubmit";
import { useToast } from "@/context/ToastContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Holiday } from "@/types";

interface Props {
    // Si viene, se edita ese feriado
    holiday?: Holiday;
    onClose: () => void;
    onSaved: () => void;
}

type HolidayForm = Omit<Holiday, 'id'>;

export const HolidayFormModal = ({ holiday, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const initial: HolidayForm = {
        name: holiday?.name ?? '',
        starts_at: holiday?.starts_at.slice(0, 10) ?? '',
        ends_at: holiday?.ends_at.slice(0, 10) ?? '',
    };
    const [form, setForm] = useState<HolidayForm>(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { handleSubmit, isPending, message } = useFormSubmit<object>({
        schema: holidaySchema,
        data: form,
        setErrors,
        onSubmit: (data) => holiday ? updateHoliday(axiosAuth, holiday.id, data) : storeHoliday(axiosAuth, data),
        onSuccess: () => {
            toast(holiday ? 'Feriado actualizado' : 'Feriado registrado');
            onSaved();
        },
    });

    const setField = (field: keyof HolidayForm, value: string) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            // Feriado de un día: al elegir el inicio se propone el mismo día como fin
            if (field === 'starts_at' && (!prev.ends_at || prev.ends_at < value)) next.ends_at = value;
            return next;
        });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <FormModal
            title={holiday ? 'Editar feriado' : 'Registrar feriado'}
            subtitle="En estas fechas los productos con IVA diferenciado facturan al 8%"
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isPending}
            isDirty={JSON.stringify(form) !== JSON.stringify(initial)}
            message={message}
        >
            <TextInput
                type="text"
                label="Nombre"
                name="name"
                value={form.name}
                error={errors.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ej. Carnaval"
                maxLength={100}
                required
            />
            <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                <TextInput
                    type="date"
                    label="Desde"
                    name="starts_at"
                    value={form.starts_at}
                    error={errors.starts_at}
                    onChange={(e) => setField('starts_at', e.target.value)}
                    required
                />
                <TextInput
                    type="date"
                    label="Hasta"
                    name="ends_at"
                    value={form.ends_at}
                    error={errors.ends_at}
                    onChange={(e) => setField('ends_at', e.target.value)}
                    min={form.starts_at || undefined}
                    required
                />
            </div>
        </FormModal>
    )
}
