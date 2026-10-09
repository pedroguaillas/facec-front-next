"use client";

import { FormModal, FormSectionTitle, IdentificationFields, TextInput } from "@/components"
import { useCarrierForm } from "../hooks/useCarrierForm";

interface Props {
    // Si viene, se edita el transportista; si no, se registra uno nuevo
    id?: string;
    onClose: () => void;
    onSaved: () => void;
}

export const CarrierForm = ({ id, onClose, onSaved }: Props) => {

    const {
        data: carrier, errors, isLoading, isDirty, isPending, message, lookupStatus,
        handleChange, setField, setType, setIdentification, handleSubmit,
    } = useCarrierForm(id, onSaved);

    return (
        <FormModal
            title={id ? 'Editar transportista' : 'Registrar transportista'}
            subtitle={id ? undefined : 'Ingresa la identificación para buscar sus datos'}
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isPending}
            isLoading={isLoading}
            isDirty={isDirty}
            message={message}
        >
            <IdentificationFields
                type={carrier.type_identification}
                identification={carrier.identication}
                error={errors.identication}
                lookupStatus={lookupStatus}
                readOnly={!!id}
                onTypeChange={setType}
                onIdentificationChange={setIdentification}
            />
            <TextInput type='text' label='Nombre' value={carrier.name} error={errors.name} onChange={handleChange} name='name' maxLength={300} required />

            <FormSectionTitle>Vehículo y contacto</FormSectionTitle>
            <div className='sm:grid sm:grid-cols-2 sm:gap-4'>
                <TextInput
                    type='text'
                    label='Placa'
                    value={carrier.license_plate}
                    error={errors.license_plate}
                    onChange={(e) => setField('license_plate', e.target.value.toUpperCase())}
                    name='license_plate'
                    maxLength={10}
                    placeholder='ABC1234'
                    className='uppercase'
                    required
                />
                <TextInput type='email' label='Correo electrónico' value={carrier.email ?? ''} error={errors.email} onChange={handleChange} name='email' maxLength={100} inputMode='email' placeholder='correo@ejemplo.com' />
            </div>
        </FormModal>
    )
}
