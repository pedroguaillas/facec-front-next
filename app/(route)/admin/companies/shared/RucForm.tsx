"use client";

import { PrimaryButton, SelectOption, TextInput } from '@/components';
import React from 'react'
import { useRucForm } from '../hooks/useRucForm';

export const RucForm = () => {

    const { ruc, errors, success, optionType, handleChange, formAction } = useRucForm();

    return (
        <form action={formAction}>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='RUC' value={ruc.ruc} error={errors.ruc} success={success.ruc} onChange={handleChange} name='ruc' maxLength={13} required/>
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Razón social' value={ruc.company} error={errors.company} onChange={handleChange} name='company' maxLength={300} required/>
                    </div>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Régimen" name='regimen' options={optionType} selectedValue={ruc.regimen} handleSelect={handleChange} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='email' label='Correo' value={ruc.email} error={errors.email} success={success.email} onChange={handleChange} name='email' maxLength={50} required/>
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Usuario' value={ruc.user} error={errors.user} success={success.user} onChange={handleChange} name='user' maxLength={20} required/>
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='password' label='Contraseña' value={ruc.password} error={errors.password} onChange={handleChange} name='password' maxLength={50} required/>
                    </div>
                </div>
            </div>

            <div className='flex justify-end items-end'>
                <div>
                    <PrimaryButton label='Guardar' type='submit' action='store' />
                </div>
            </div>
        </form>
    )
}
