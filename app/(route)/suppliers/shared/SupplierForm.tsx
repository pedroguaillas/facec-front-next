"use client";
import { useSupplierForm } from "../hooks/useSupplierForm";
import { SelectOption, TextInput } from "@/components"
import { ButtonSubmit } from "./ButtonSubmit";

export const SupplierForm = () => {
    const { supplier, errors, handleChange, handleSubmit } = useSupplierForm();

    const optionType = [
        { label: 'Cédula', value: 'cédula' },
        { label: 'RUC', value: 'ruc' },
    ]

    return (
        <form action={handleSubmit}>
            <strong className='font-bold'>Datos generales</strong>

            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Tipo de identificación" name='type_identification' options={optionType} selectedValue={supplier.type_identification} handleSelect={handleChange} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type="text" label="Identificación *" value={supplier.identication} name="identication" error={errors.identication} onChange={handleChange} maxLength={13} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type="text" label="Razon social / Proveedor *" value={supplier.name} name="name" error={errors.name} onChange={handleChange} maxLength={300} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type="text" label="Dirección" value={supplier.address ?? ''} name="address" error={errors.address} onChange={handleChange} maxLength={300} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type="text" label="Teléfono" value={supplier.phone ?? ''} name="phone" error={errors.phone} onChange={handleChange} maxLength={20} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type="email" label="Correo" value={supplier.email ?? ''} name="email" error={errors.email} onChange={handleChange} maxLength={50} />
                    </div>
                </div>
            </div>

            <ButtonSubmit />
        </form>
    )
}
