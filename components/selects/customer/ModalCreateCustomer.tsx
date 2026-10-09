"use client";

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FormModal, FormSectionTitle } from '@/components/form-modal/FormModal';
import { IdentificationFields } from '@/components/identification-fields/IdentificationFields';
import { TextInput } from '@/components/text-input/TextInput';
import { useToast } from '@/context/ToastContext';
import { useCreateCustomer } from './hooks/useCreateCustomer';
import { Customer, CustomerProps } from '@/types';

interface Props {
    handleSelect: (custom: CustomerProps) => void;
}

export const ModalCreateCustomer = ({ handleSelect }: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const { toast } = useToast();

    const open = () => {
        setFormKey(key => key + 1); // formulario limpio en cada apertura
        setIsOpen(true);
    };

    const handleSaved = (saved?: Customer) => {
        setIsOpen(false);
        if (!saved) return;
        handleSelect({ id: Number(saved.id), atts: { identication: saved.identication, name: saved.name } });
        toast('Cliente registrado y seleccionado');
    };

    return (
        <>
            <button
                type="button"
                onClick={open}
                className='shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary hover:bg-primaryhover text-white cursor-pointer transition-colors active:scale-[0.97]'
                title="Registrar nuevo cliente"
                aria-label="Registrar nuevo cliente"
            >
                <FaPlus className="text-sm" />
            </button>

            {isOpen && (
                <CreateCustomerForm key={formKey} onClose={() => setIsOpen(false)} onSaved={handleSaved} />
            )}
        </>
    )
}

interface FormProps {
    onClose: () => void;
    onSaved: (saved?: Customer) => void;
}

const CreateCustomerForm = ({ onClose, onSaved }: FormProps) => {

    const {
        data: customer, errors, isDirty, isPending, message, lookupStatus,
        handleChange, setType, setIdentification, handleSubmit,
    } = useCreateCustomer(onSaved);

    return (
        <FormModal
            title="Registrar cliente"
            subtitle="Se seleccionará automáticamente en la venta"
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isPending}
            isDirty={isDirty}
            message={message}
            submitLabel="Guardar y seleccionar"
        >
            <IdentificationFields
                types={['cédula', 'ruc']}
                type={customer.type_identification}
                identification={customer.identication}
                error={errors.identication}
                lookupStatus={lookupStatus}
                onTypeChange={setType}
                onIdentificationChange={setIdentification}
            />
            <TextInput type='text' label='Nombre' value={customer.name} error={errors.name} onChange={handleChange} name='name' maxLength={300} placeholder='Nombre o razón social' required />

            <FormSectionTitle>Contacto</FormSectionTitle>
            <TextInput type='text' label='Dirección' value={customer.address ?? ''} error={errors.address} onChange={handleChange} name='address' maxLength={300} required />
            <div className='sm:grid sm:grid-cols-2 sm:gap-4'>
                <TextInput type='tel' label='Teléfono' value={customer.phone ?? ''} error={errors.phone} onChange={handleChange} name='phone' maxLength={20} inputMode='tel' />
                <TextInput type='email' label='Correo' value={customer.email ?? ''} error={errors.email} onChange={handleChange} name='email' maxLength={50} inputMode='email' placeholder='correo@ejemplo.com' />
            </div>
        </FormModal>
    )
}
