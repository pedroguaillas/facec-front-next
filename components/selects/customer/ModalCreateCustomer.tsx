"use client";

import { Modal } from '@/components/modal/Modal';
import { PrimaryButton } from '@/components/primary-button/PrimaryButton';
import { SelectOption } from '@/components/select-option/SelectOption';
import { TextInput } from '@/components/text-input/TextInput';
import { FaPlusCircle } from 'react-icons/fa';
import { useModalForm } from './hooks/useModalForm';
import { CustomerProps } from '@/types';

interface Props {
    handleSelect: (custom: CustomerProps) => void;
}

export const ModalCreateCustomer = ({ handleSelect }: Props) => {

    const { isOpen, customer, errors, optionType, isSaving, toogle, handleChange, saveCustomer } = useModalForm();

    return (
        <>
            <button
                onClick={toogle}
                className='rounded-r p-2 bg-primary text-white cursor-pointer'>
                <FaPlusCircle />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={toogle}
                title="Registrar un nuevo cliente"
                modalSize="sm"
            >

                <SelectOption label="Tipo de identificación" name='type_identification' options={optionType} selectedValue={customer.type_identification} handleSelect={handleChange} />
                <TextInput type='text' label='Identificación' value={customer.identication} error={errors.identication} onChange={handleChange} name='identication' maxLength={customer.type_identification === 'cédula' ? 10 : 13} required />
                <TextInput type='text' label='Nombre' value={customer.name} error={errors.name} onChange={handleChange} name='name' maxLength={300} required />

                <TextInput type='text' label='Dirección' value={customer.address ?? ''} error={errors.address} onChange={handleChange} name='address' maxLength={300} required />
                <TextInput type='text' label='Teléfono' value={customer.phone ?? ''} error={errors.phone} onChange={handleChange} name='phone' maxLength={20} />
                <TextInput type='email' label='Correo' value={customer.email ?? ''} error={errors.email} onChange={handleChange} name='email' maxLength={50} />

                <PrimaryButton type='button' label='Guardar' action='store' isLoading={isSaving} onClick={() => saveCustomer(handleSelect)} />

            </Modal>
        </>
    )
}
