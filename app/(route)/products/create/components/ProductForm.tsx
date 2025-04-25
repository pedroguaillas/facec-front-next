"use client";

import { useProductCreateContext } from '../../context/ProductCreateContext';
import { SelectOption, Separate, TextInput } from '@/components';
import React, { useState } from 'react';

export const ProductForm = () => {

    const { product, errorProduct, setProduct, ivaTaxes, iceCataloges } = useProductCreateContext();
    const [breakdown, setBreakdown] = useState<boolean>(false);
    const [total, setTotal] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProduct((prevState) => ({ ...prevState, [event.target.name]: event.target.value }))
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setProduct((prevState) => ({ ...prevState, [event.target.name]: Number(event.target.value) }))
    }

    const onChangeCheckbox = () => {
        setBreakdown(!breakdown);
    }

    const handleTotal = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value) || value === '') {
            setTotal(value);
            const price = parseFloat((parseFloat(value) / 1.15).toFixed(6));
            setProduct((prevState) => ({ ...prevState, price1: price }));
        }
    }

    const optionType = [
        { value: 1, label: 'Producto' },
        { value: 2, label: 'Servicio' },
    ];

    return (
        <>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Código *' value={product.code} error={errorProduct.code} onChange={handleChange} name='code' maxLength={25} />
                    </div>
                    {product.iva === 5 && (
                        <div className='lg:w-2/3'>
                            <TextInput type='text' label='Código aux *' value={product.aux_cod ?? ''} error={errorProduct.aux_cod} onChange={handleChange} name='aux_cod' maxLength={25} />
                        </div>
                    )}
                    <div className='lg:w-2/3'>
                        <SelectOption label="Tipo" name='type_product' options={optionType} selectedValue={product.type_product} handleSelect={handleSelect} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Nombre *' value={product.name} error={errorProduct.name} onChange={handleChange} name='name' maxLength={300} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <input type='checkbox' checked={breakdown} onChange={onChangeCheckbox} /> ¿Necesitas desglosar el IVA?
                    </div>
                    <div className='lg:w-2/3'>
                        <label className='text-sm'>Precio *</label>
                        <div className='flex flex-row'>
                            <input type='text' value={total} onChange={handleTotal} placeholder='Total' maxLength={15}
                                className={`p-1 border border-l-slate-400 border-r-white border-y-slate-400 rounded-l 
                                ${breakdown ? 'block' : 'hidden'}`} />
                            <input type='number' value={product.price1} onChange={handleChange} name='price1' 
                            className={`p-1 border 
                                ${breakdown ? 'rounded-r' : 'rounded'}
                                ${errorProduct.price1 ? 'border-red-400' : 'border-slate-400'}
                                `} />
                        </div>
                        {errorProduct.price1 && <p className="text-sm text-red-500">{errorProduct.price1}</p>}
                    </div>
                </div>
            </div>

            <Separate />

            <strong className='font-bold'>Impuestos</strong>

            {/* Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Imp. al IVA" name='iva' options={ivaTaxes} selectedValue={product.iva} handleSelect={handleSelect} />
                    </div>
                </div>

                {/* Col 2 */}
                {iceCataloges.length > 0 && (
                    <div className='w-full'>
                        <div className='lg:w-2/3'>
                            <SelectOption label="Imp. al ICE" name='iva' options={iceCataloges} selectedValue={product.iva} handleSelect={handleSelect} />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
