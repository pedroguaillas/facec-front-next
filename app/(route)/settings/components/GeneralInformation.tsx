"use client";

import { SelectOption } from "@/components"
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
        logo: '',
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

    useEffect(() => {
        const fetchCompany = async () => {
            const response = await axiosAuth.get('companies');
            setForm(response.data.company)
        }

        fetchCompany()
    }, [axiosAuth])

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
                        <input type="checkbox" checked={form.accounting} onChange={handleChange} />
                        Obligado llevar contabilidad?
                    </label>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Régimen" name='rimpe' options={optionType} selectedValue={form.rimpe} handleSelect={handleChange} />
                    </div>
                    <label className=" inline-flex gap-2">
                        <input type="checkbox" checked={form.retention_agent} onChange={handleChange} />
                        Agente de Retención?
                    </label>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <label className=" inline-flex gap-2 mt-2">
                        <input type="file" value={form.logo} onChange={handleChange} />
                    </label>
                </div>
            </div>
        </>
    )
}
