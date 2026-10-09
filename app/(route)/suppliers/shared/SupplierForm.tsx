"use client";

import { FormModal, FormSectionTitle, IdentificationFields, TextInput } from "@/components"
import { useSupplierForm } from "../hooks/useSupplierForm";

interface Props {
    // Si viene, se edita el proveedor; si no, se registra uno nuevo
    id?: string;
    onClose: () => void;
    onSaved: () => void;
}

export const SupplierForm = ({ id, onClose, onSaved }: Props) => {

    const {
        data: supplier, errors, isLoading, isDirty, isPending, message, lookupStatus,
        handleChange, setType, setIdentification, handleSubmit,
    } = useSupplierForm(id, onSaved);

    return (
        <FormModal
            title={id ? 'Editar proveedor' : 'Registrar proveedor'}
            subtitle={id ? undefined : 'Ingresa la identificación para buscar sus datos'}
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isPending}
            isLoading={isLoading}
            isDirty={isDirty}
            message={message}
        >
            <IdentificationFields
                type={supplier.type_identification}
                identification={supplier.identication}
                error={errors.identication}
                lookupStatus={lookupStatus}
                readOnly={!!id}
                onTypeChange={setType}
                onIdentificationChange={setIdentification}
            />
            <TextInput type="text" label="Razón social / Proveedor" value={supplier.name} name="name" error={errors.name} onChange={handleChange} maxLength={300} required />

            <FormSectionTitle>Contacto</FormSectionTitle>
            <TextInput type="text" label="Dirección" value={supplier.address ?? ''} name="address" error={errors.address} onChange={handleChange} maxLength={300} required />
            <div className='sm:grid sm:grid-cols-2 sm:gap-4'>
                <TextInput type="tel" label="Teléfono" value={supplier.phone ?? ''} name="phone" error={errors.phone} onChange={handleChange} maxLength={20} inputMode="tel" />
                <TextInput type="email" label="Correo" value={supplier.email ?? ''} name="email" error={errors.email} onChange={handleChange} maxLength={50} inputMode="email" placeholder="correo@ejemplo.com" />
            </div>
        </FormModal>
    )
}
