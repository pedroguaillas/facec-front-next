"use client";

import { SelectOption, TextInput } from '@/components';
import React from 'react';
import { useCreateInvoice } from '../../context/InvoiceCreateContext';

export const GeneralInformation = () => {

    const { invoice, setInvoice } = useCreateInvoice();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInvoice((prevState) => ({ ...prevState, [event.target.name]: event.target.value }))
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setInvoice((prevState) => ({ ...prevState, [event.target.name]: Number(event.target.value) }))
    }

    const invoiceTypes = [
        { value: 1, label: 'Factura' },
        { value: 2, label: 'Nota de Crédito' },
    ];
    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='md:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='w-2/4'>
                        <TextInput type='date' label='Fecha emisión' value={invoice.date} onChange={handleChange} name='date' />
                    </div>

                    <div className="flex flex-col w-2/3">
                        <SelectOption label="Punto Emi" options={invoiceTypes} selectedValue={1} handleSelect={handleSelect} />
                    </div>
                    <div className='py-2'><span>N° de serie </span>{invoice.serie}</div>
                    <div><span>Cliente </span> </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    {/* Select */}

                    <div className="flex flex-col w-2/3">
                        <SelectOption label="Tipo de comprobante" options={invoiceTypes} selectedValue={1} handleSelect={handleSelect} />
                    </div>

                    <div className='w-2/3'>
                        <TextInput label='Guia de Remisión' value={invoice.guia} onChange={handleChange} name='guia' />
                    </div>
                    <div className='w-2/3'>
                        <TextInput type='date' label='Emisión factura *' value='' onChange={handleChange} name='date_order' />
                    </div>
                    <div className='w-2/3'>
                        <TextInput label='Serie factura *' value='' onChange={handleChange} name='serie_order' />
                    </div>
                    <div className='w-2/3'>
                        <TextInput label='Motivo *' value='' onChange={handleChange} name='rason' />
                    </div>
                </div>
            </div>
        </div>
    )
}
