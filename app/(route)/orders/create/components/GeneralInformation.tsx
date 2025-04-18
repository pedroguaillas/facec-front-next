"use client";

import { SelectCustomer, SelectOption, TextInput } from '@/components';
import { useCreateInvoice } from '../../context/InvoiceCreateContext';
import { useSelectPoint } from '../hooks/useSelectPoint';
import React from 'react';

export const GeneralInformation = () => {

    const { invoice, selectPoint, points, setInvoice, setSelectPoint } = useCreateInvoice();

    const invoiceTypes = [
        { value: 1, label: 'Factura' },
        { value: 4, label: 'Nota de Crédito' },
    ];

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    // Solo le llamo a este Hooks para que se ejecute el useEffect que tiene dentro
    useSelectPoint();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInvoice((prevState) => ({ ...prevState, [event.target.name]: event.target.value }))
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setInvoice((prevState) => ({ ...prevState, [event.target.name]: Number(event.target.value) }))
    }

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        setSelectPoint(selectedPoint !== undefined ? selectedPoint : null);
    }

    const handleSelectCustomer = (customer: CustomerPaginate) => {
        setInvoice((prevState) => ({ ...prevState, customer_id: customer.id }))
    }

    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='date' label='Fecha emisión' value={invoice.date} onChange={handleChange} name='date' />
                    </div>
                    {points.length > 1 && (
                        <div className="flex flex-col lg:w-2/3">
                            <SelectOption label="Punto Emi" options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ''} handleSelect={handleSelectPoint} />
                        </div>
                    )}
                    <div className='py-2'><span>N° de serie </span>{invoice.serie}</div>
                    <div className='flex flex-col lg:w-2/3'>
                        <span>Cliente</span>
                        <SelectCustomer selectCustomer={handleSelectCustomer} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className="flex flex-col lg:w-2/3">
                        <SelectOption label="Tipo de comprobante" options={invoiceTypes} selectedValue={invoice.voucher_type} handleSelect={handleSelect} />
                    </div>
                    {/* Solo en el caso de facturas */}
                    {invoice.voucher_type === 1 && (
                        <div className='lg:w-2/3'>
                            <TextInput label='Guia de Remisión' value={invoice.guia} onChange={handleChange} name='guia' />
                        </div>
                    )}
                    {/* En el caso de Notas de Crédito */}
                    {invoice.voucher_type === 4 && (
                        <>
                            <div className='lg:w-2/3'>
                                <TextInput type='date' label='Emisión factura *' value='' onChange={handleChange} name='date_order' />
                            </div>
                            <div className='lg:w-2/3'>
                                <TextInput label='Serie factura *' value='' onChange={handleChange} name='serie_order' />
                            </div>
                            <div className='lg:w-2/3'>
                                <TextInput label='Motivo *' value='' onChange={handleChange} name='rason' />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
