"use client";

import { FormModal, FormSectionTitle, IdentificationFields, TextInput } from '@/components';
import { useCustomerForm } from '../hooks/useCustomerForm';

interface Props {
    // Si viene, se edita el cliente; si no, se registra uno nuevo
    id?: string;
    onClose: () => void;
    onSaved: () => void;
}

export const CustomerForm = ({ id, onClose, onSaved }: Props) => {

    const {
        data: customer, errors, isLoading, isDirty, isPending, message, lookupStatus,
        handleChange, setType, setIdentification, handleSubmit,
    } = useCustomerForm(id, onSaved);

    return (
        <FormModal
            title={id ? 'Editar cliente' : 'Registrar cliente'}
            subtitle={id ? undefined : 'Ingresa la identificación para buscar sus datos'}
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isPending}
            isLoading={isLoading}
            isDirty={isDirty}
            message={message}
        >
            <IdentificationFields
                type={customer.type_identification}
                identification={customer.identication}
                error={errors.identication}
                lookupStatus={lookupStatus}
                readOnly={!!id}
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

