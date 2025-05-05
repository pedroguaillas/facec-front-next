"use client";

import { useCarrierFormContext } from "../context/CarrierFormContext";
import { SelectOption, TextInput } from "@/components"
import { ChangeEvent } from "react";

export const CarrierForm = () => {

    const { carrier, errors, setCarrier, setErrors } = useCarrierFormContext();

    const optionType = [
        { label: 'Cédula', value: 'cédula' },
        { label: 'RUC', value: 'ruc' },
    ]

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCarrier(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    return (
        <div className='sm:flex gap-4'>

            {/* Col 1 */}
            < div className='w-full sm:max-w-sm' >

                <SelectOption label="Tipo de identificación" name='type_identification' options={optionType} selectedValue={carrier.type_identification} handleSelect={handleChange} />

                <TextInput type='text' label='Identificación *' value={carrier.identication} error={errors.identication} onChange={handleChange} name='identication' maxLength={13} />

                <TextInput type='text' label='Nombre *' value={carrier.name} error={errors.name} onChange={handleChange} name='name' maxLength={300} />

                <TextInput type='text' label='Placa *' value={carrier.license_plate} error={errors.license_plate} onChange={handleChange} name='license_plate' maxLength={10} />

                <TextInput type='email' label='Correo electrónico' value={carrier.email ?? ''} error={errors.email} onChange={handleChange} name='email' maxLength={100} />

            </div>
        </div>
    )
}