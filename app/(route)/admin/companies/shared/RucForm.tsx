"use client";

import { Alert, PrimaryButton, SegmentedControl, SelectOption, Separate, TextInput } from '@/components';
import { planOptions } from '@/constants/plans';
import { addDaysToDate, getDate } from '@/helpers/dateHelper';
import React from 'react'
import { useRucForm } from '../hooks/useRucForm';

export const RucForm = () => {

    const { ruc, errors, success, optionType, message, handleChange, handlePlanChange, formAction } = useRucForm();
    const selectedPlan = planOptions.find(option => option.value === ruc.plan);

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
                        <SelectOption label="Régimen" name='rimpe' options={optionType} selectedValue={ruc.rimpe} handleSelect={handleChange} />
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

            <Separate />
            <strong className='font-bold'>Plan</strong>

            <div className='sm:flex gap-4'>
                <div className='w-full'>
                    <SegmentedControl
                        label='Plan de suscripción'
                        name='plan'
                        value={ruc.plan}
                        options={planOptions}
                        onChange={handlePlanChange}
                    />
                    {selectedPlan && <p className='text-xs text-gray-500 dark:text-gray-400'>{selectedPlan.description}</p>}
                    {errors.plan && <p className='text-xs text-red-500 mt-1'>{errors.plan}</p>}
                </div>
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput
                            type='date'
                            label='Vence el'
                            name='plan_ends_at'
                            value={ruc.plan_ends_at}
                            error={errors.plan_ends_at}
                            onChange={handleChange}
                            min={addDaysToDate(getDate(), 1)}
                            hint={ruc.plan === 'GRATUITO' ? 'Opcional: sin fecha la prueba dura 1 mes' : undefined}
                            required={ruc.plan !== 'GRATUITO'}
                        />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput
                            type='number'
                            label='Monto pagado'
                            name='plan_amount'
                            value={ruc.plan_amount}
                            error={errors.plan_amount}
                            onChange={handleChange}
                            inputMode='decimal'
                            min='0'
                            placeholder='0.00'
                            hint={ruc.plan === 'GRATUITO' ? 'Opcional en el plan gratuito' : undefined}
                            required={ruc.plan !== 'GRATUITO'}
                        />
                    </div>
                </div>
            </div>

            {message && <div className='mt-4'><Alert message={message} /></div>}

            <div className='flex justify-end items-end'>
                <div>
                    <PrimaryButton label='Guardar' type='submit' action='store' />
                </div>
            </div>
        </form>
    )
}
