"use client";

import { LabelComponent, SelectCustomer, SelectOption, TextInput } from '@/components';
import { useFormInvoice } from '../context/FormInvoiceContext';
import { getDate } from "@/helpers/dateHelper";
import { useSelectPoint } from '../hooks/useSelectPoint';
import { useParams } from "next/navigation";
import { CustomerProps } from '@/types';
import React from 'react';
import { useSession } from 'next-auth/react';
import { ORDER_VOUCHER_TYPE_SLUG } from '@/constants';

export const GeneralInformation = () => {

    const { invoice, formErrors, points, voucherTypes, selectPoint, selectCustom, setInvoice, setFormErrors, setSelectCustom, setSelectPoint } = useFormInvoice();
    const params = useParams();
    const { data: session } = useSession();

    const optionVoucherTypes = voucherTypes.map((vt) => ({ value: vt.id, label: vt.name }));
    const selectedVoucherType = voucherTypes.find((vt) => vt.id === Number(invoice.voucher_type_id));
    const isFactura = selectedVoucherType?.slug === ORDER_VOUCHER_TYPE_SLUG.FACTURA;
    const isNotaCredito = selectedVoucherType?.slug === ORDER_VOUCHER_TYPE_SLUG.NOTA_CREDITO;

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    const getMinDateNC = () => {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 1);
        return minDate.toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
    }

    // Solo le llamo a este Hooks para que se ejecute el useEffect que tiene dentro
    useSelectPoint();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setInvoice((prevState) => ({ ...prevState, [name]: value }))
        setFormErrors(prev => ({ ...prev, name: '' }));
    }

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        setSelectPoint(selectedPoint !== undefined ? selectedPoint : null);
        setFormErrors(prev => ({ ...prev, point_id: '' }));
    }

    const handleSelectCustomer = (customer: CustomerProps) => {
        setInvoice((prevState) => ({ ...prevState, customer_id: customer.id }))
        setSelectCustom(customer);
        setFormErrors(prev => ({ ...prev, customer_id: '' }));
    }

    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='py-2'><span className='font-bold'>Fecha emisión: </span>{invoice.date}</div>
                    {/* <div className='lg:w-2/3'>
                        <TextInput type='date' label='Fecha emisión' value={invoice.date} error={formErrors.date} onChange={handleChange} name='date' min={getMinDate()} max={getDate()} required />
                    </div> */}
                    {points.length > 1 && !params.id && (
                        <div className="flex flex-col lg:w-2/3">
                            <SelectOption label="Punto Emi" name='emision_point_id' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ''} error={formErrors.point_id} handleSelect={handleSelectPoint} required />
                        </div>
                    )}
                    <div className='flex flex-col lg:w-2/3'>
                        <LabelComponent name='name' label='Cliente' required />
                        <SelectCustomer label={selectCustom?.atts.name ?? ''} error={formErrors.customer_id} selectCustomer={handleSelectCustomer} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className="flex flex-col lg:w-2/3">
                        <SelectOption label="Tipo de comprobante" name='voucher_type_id' options={optionVoucherTypes} selectedValue={invoice.voucher_type_id} handleSelect={handleChange} />
                    </div>
                    {/* Solo en el caso de facturas */}
                    {isFactura && session?.user.permissions.guia_in_invoice && (
                        <div className='lg:w-2/3'>
                            <TextInput label='Guia de Remisión' value={invoice.guia ?? ''} error={formErrors.guia} onChange={handleChange} maxLength={17} name='guia' />
                        </div>
                    )}
                    {/* En el caso de Notas de Crédito */}
                    {isNotaCredito && (
                        <>
                            <div className='lg:w-2/3'>
                                <TextInput type='date' label='Emisión factura' value={invoice.date_order ?? ''} error={formErrors.date_order} onChange={handleChange} name='date_order' min={getMinDateNC()} max={getDate()} required />
                            </div>
                            <div className='lg:w-2/3'>
                                <TextInput label='Serie factura' value={invoice.serie_order ?? ''} error={formErrors.serie_order} onChange={handleChange} name='serie_order' maxLength={17} required />
                            </div>
                            <div className='lg:w-2/3'>
                                <TextInput label='Motivo' value={invoice.reason ?? ''} error={formErrors.reason} onChange={handleChange} name='reason' required />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
