"use client";

import { LabelComponent, Notice, SelectCustomer, SelectOption, TextInput } from '@/components';
import { useFormInvoice } from '../context/FormInvoiceContext';
import { getDate } from "@/helpers/dateHelper";
import { useSelectPoint } from '../hooks/useSelectPoint';
import { useParams } from "next/navigation";
import { CustomerProps } from '@/types';
import React from 'react';
import { useSession } from 'next-auth/react';
import { CONSUMIDOR_FINAL_IDENTICATION, NC_FINAL_CONSUMER_ERROR, ORDER_VOUCHER_TYPE_SLUG } from '@/constants';
import { FormSection } from './FormSection';

export const GeneralInformation = () => {

    const { invoice, formErrors, points, voucherTypes, activeHoliday, selectPoint, selectCustom, setInvoice, setFormErrors, setSelectCustom, setSelectPoint } = useFormInvoice();
    const params = useParams();
    const { data: session } = useSession();

    const optionVoucherTypes = voucherTypes.map((vt) => ({ value: vt.id, label: vt.name }));
    const selectedVoucherType = voucherTypes.find((vt) => vt.id === Number(invoice.voucher_type_id));
    const isFactura = selectedVoucherType?.slug === ORDER_VOUCHER_TYPE_SLUG.FACTURA;
    const isNotaCredito = selectedVoucherType?.slug === ORDER_VOUCHER_TYPE_SLUG.NOTA_CREDITO;
    // El SRI no admite notas de crédito a consumidor final: se avisa apenas se elige el cliente
    const ncToFinalConsumer = isNotaCredito && selectCustom?.atts.identication === CONSUMIDOR_FINAL_IDENTICATION;

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

    // dd/mm/yyyy para mostrar
    const [year, month, day] = invoice.date.slice(0, 10).split('-');

    return (
        <FormSection
            title="Comprobante"
            aside={<span className="text-xs text-ink-3">Emisión <span className="font-medium text-ink-1 tabular-nums">{day}/{month}/{year}</span></span>}
        >
            {activeHoliday && (
                <div className='mb-3'>
                    <Notice tone='info' title={`Feriado ${activeHoliday.name}: IVA 8% en servicios turísticos`}>
                        Los productos con IVA diferenciado se facturan al 8% en vez del 15%.
                    </Notice>
                </div>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6'>
                <SelectOption label="Tipo de comprobante" name='voucher_type_id' options={optionVoucherTypes} selectedValue={invoice.voucher_type_id} handleSelect={handleChange} />
                {points.length > 1 && !params.id && (
                    <SelectOption label="Punto de emisión" name='emision_point_id' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ''} error={formErrors.point_id} handleSelect={handleSelectPoint} required />
                )}
                <div className='flex flex-col gap-1.5 my-2 sm:col-span-2'>
                    <LabelComponent name='name' label='Cliente' required />
                    <SelectCustomer label={selectCustom?.atts.name ?? ''} error={formErrors.customer_id || (ncToFinalConsumer ? NC_FINAL_CONSUMER_ERROR : undefined)} selectCustomer={handleSelectCustomer} />
                </div>
                {/* Solo en el caso de facturas */}
                {isFactura && session?.user.permissions.guia_in_invoice && (
                    <TextInput label='Guía de remisión' value={invoice.guia ?? ''} error={formErrors.guia} onChange={handleChange} maxLength={17} name='guia' />
                )}
                {/* En el caso de Notas de Crédito */}
                {isNotaCredito && (
                    <>
                        <TextInput type='date' label='Emisión factura' value={invoice.date_order ?? ''} error={formErrors.date_order} onChange={handleChange} name='date_order' min={getMinDateNC()} max={getDate()} required />
                        <TextInput label='Serie factura' value={invoice.serie_order ?? ''} error={formErrors.serie_order} onChange={handleChange} name='serie_order' maxLength={17} placeholder='001-001-000000001' required />
                        <div className='sm:col-span-2'>
                            <TextInput label='Motivo' value={invoice.reason ?? ''} error={formErrors.reason} onChange={handleChange} name='reason' required />
                        </div>
                    </>
                )}
            </div>
        </FormSection>
    )
}
