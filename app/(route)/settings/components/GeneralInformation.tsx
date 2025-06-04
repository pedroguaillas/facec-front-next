"use client";

import { PrimaryButton, SelectOption, TextInput } from "@/components"
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { ChangeEvent, useEffect, useState } from "react";

export const GeneralInformation = () => {

    const axiosAuth = useAxiosAuth();

    const [form, setForm] = useState({
        ruc: '',
        company: '',
        rimpe: '0',
        accounting: false,
        retention_agent: false,
        pass_cert: '',
        logo: null as File | null,
        cert: null as File | null,
    });

    const optionType = [
        { label: 'GENERAL', value: '0' },
        { label: 'RIMPE EMPRENDEDOR', value: '1' },
        { label: 'RIMPE NEGOCIO POPULAR', value: '2' },
    ]

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: checked }))
    }

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        setForm(prev => ({ ...prev, [name]: files?.[0] }))
    }

    useEffect(() => {
        const fetchCompany = async () => {
            const response = await axiosAuth.get('companies');
            setForm(response.data.company)
        }

        fetchCompany()
    }, [axiosAuth])

    // useEffect(() => {
    //     console.log(form)
    // }, [form.cert])

    return (
        <>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='py-2'><span className='font-bold'>RUC: </span>{form.ruc}</div>
                    <div className='py-2'><span className='font-bold'>Razón social: </span>{form.company}</div>
                    <label className=" inline-flex gap-2 mt-2">
                        <input type="checkbox" checked={form.accounting} onChange={handleCheckbox} name="accounting" />
                        Obligado llevar contabilidad?
                    </label>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Régimen" name='rimpe' options={optionType} selectedValue={form.rimpe} handleSelect={handleChange} />
                    </div>
                    <label className=" inline-flex gap-2">
                        <input type="checkbox" checked={form.retention_agent} onChange={handleCheckbox} name="retention_agent" />
                        Agente de Retención?
                    </label>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='py-2 flex flex-col gap-2'>
                        <label className=" inline-flex gap-2 mt-2">Logo</label>
                        <input type="file" className="bg-gray-100 dark:bg-gray-700" onChange={handleFile} accept="image/*" />
                    </div>
                    <div className='py-2 lg:w-1/3'>
                        <TextInput type='password' label='Contraseña de firma electrónica' value={form.pass_cert} onChange={handleChange} name='pass_cert' maxLength={50} />
                    </div>
                    <div className='py-2 flex flex-col gap-2'>
                        <label className=" inline-flex gap-2 mt-2">Certificado de firma electrónica</label>
                        <input type="file" className="bg-gray-100 dark:bg-gray-700" onChange={handleFile} accept=".p12,.pfx" />
                    </div>
                </div>
            </div>

            <div className='flex justify-end'>
                <div className='w-28'>
                    <PrimaryButton label='Guardar' type='submit' action={'store'} />
                </div>
            </div>
        </>
    )
}
