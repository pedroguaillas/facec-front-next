"use client";

import { Modal } from '@/components/modal/Modal';
import { PrimaryButton } from '@/components/primary-button/PrimaryButton';
import { SelectOption } from '@/components/select-option/SelectOption';
import { TextInput } from '@/components/text-input/TextInput';
import { supplierSchema } from '@/schemas/supplier.schema';
import { Supplier } from '@/types';
import { ChangeEvent, useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    supplier: Supplier;
    onSave: (supplier: Supplier) => Promise<void>;
}

const optionType = [
    { label: 'Cédula', value: 'cédula' },
    { label: 'RUC', value: 'ruc' },
    { label: 'Otro', value: 'otro' },
];

export const ModalConfirmSupplier = ({ isOpen, onClose, supplier, onSave }: Props) => {

    const [form, setForm] = useState<Supplier>(supplier);
    const [errors, setErrors] = useState<Partial<Record<keyof Supplier, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(supplier);
            setErrors({});
        }
    }, [isOpen, supplier]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSave = async () => {
        const parsed = supplierSchema.safeParse(form);

        if (!parsed.success) {
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });
            setErrors(formatted);
            return;
        }

        setIsSaving(true);
        await onSave(form);
        setIsSaving(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirmar datos del proveedor"
            modalSize="sm"
        >
            <SelectOption
                label="Tipo de identificación"
                name="type_identification"
                options={optionType}
                selectedValue={form.type_identification}
                handleSelect={handleChange}
            />
            <TextInput
                type="text"
                label="Identificación"
                value={form.identication}
                error={errors.identication}
                onChange={handleChange}
                name="identication"
                maxLength={13}
                required
            />
            <TextInput
                type="text"
                label="Razón social"
                value={form.name}
                error={errors.name}
                onChange={handleChange}
                name="name"
                maxLength={300}
                required
            />
            <TextInput
                type="text"
                label="Dirección"
                value={form.address ?? ''}
                error={errors.address}
                onChange={handleChange}
                name="address"
                maxLength={300}
            />
            <TextInput
                type="text"
                label="Teléfono"
                value={form.phone ?? ''}
                error={errors.phone}
                onChange={handleChange}
                name="phone"
                maxLength={20}
            />
            <TextInput
                type="email"
                label="Correo"
                value={form.email ?? ''}
                error={errors.email}
                onChange={handleChange}
                name="email"
                maxLength={50}
            />

            <PrimaryButton type="button" label="Guardar proveedor" action="store" isLoading={isSaving} onClick={handleSave} />
        </Modal>
    );
};
