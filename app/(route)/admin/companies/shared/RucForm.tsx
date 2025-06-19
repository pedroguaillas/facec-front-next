"use client";

import { PrimaryButton, SelectOption, TextInput } from '@/components';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { companySchema } from '@/schemas/company.schema';
import { findCompanyByRuc } from '@/services/sriServices';
import React, { ChangeEvent, useActionState, useEffect, useState } from 'react'
import { storeCompany } from '../services/companiesServices';
import { useRouter } from 'next/navigation';

interface initialRuc {
    ruc: string,
    company: string,
    regimen: number,
    user: string,
    password: string,
    email: string,
}

export const RucForm = () => {

    const [ruc, setRuc] = useState<initialRuc>({
        ruc: '',
        company: '',
        regimen: 0,
        user: '',
        password: '',
        email: '',
    });

    const axiosAuth = useAxiosAuth();
    const router = useRouter();

    const [errors, setErrors] = useState<Partial<Record<keyof initialRuc, string>>>({});

    const optionType = [
        { value: 0, label: 'GENERAL' },
        { value: 1, label: 'RIMPE EMPRENDEDOR' },
        { value: 2, label: 'RIMPE NEGOCIO POPULAR' },
    ]

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setRuc(prev => ({
            ...prev,
            [name]: name === 'regimen' ? Number(value) : value
        }));

        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const [, formAction] = useActionState(
        async (prevState: unknown, queryData: FormData) => {

            const customer = Object.fromEntries(
                Array.from(queryData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            );

            const parsed = companySchema.safeParse(customer);

            if (!parsed.success) {
                console.log('errores', parsed.error)
                const formatted: Record<string, string> = {};
                parsed.error.errors.forEach(err => {
                    formatted[err.path[0] as string] = err.message;
                });
                setErrors(formatted);
                return;
            }

            const res = await storeCompany(axiosAuth, parsed.data);
            console.log(res)
            router.push('/customers');
        }, null
    );

    useEffect(() => {
        const handleCustom = async () => {
            const res = await findCompanyByRuc(axiosAuth, ruc.ruc);
            if (res !== null) {
                setRuc(prev => ({
                    ...prev,
                    company: res.company,
                }));
            }
        }

        const identication = ruc.ruc.trim();

        if (identication.length === 13) {
            handleCustom();
        }

    }, [ruc.ruc, axiosAuth])

    return (
        <form action={formAction}>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='RUC *' value={ruc.ruc} error={errors.ruc} onChange={handleChange} name='ruc' maxLength={13} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Razon social *' value={ruc.company} error={errors.company} onChange={handleChange} name='company' maxLength={300} />
                    </div>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Regimen" name='regimen' options={optionType} selectedValue={ruc.regimen} handleSelect={handleChange} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Usuario *' value={ruc.user} error={errors.user} onChange={handleChange} name='user' maxLength={20} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='password' label='Contraseña *' value={ruc.password} error={errors.password} onChange={handleChange} name='password' maxLength={50} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='email' label='Correo *' value={ruc.email} error={errors.email} onChange={handleChange} name='email' maxLength={50} />
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
