"use client";

import { LabelComponent, SelectOption, Separate, TextInput } from '@/components';
import { useProductForm } from '../hooks/useProductForm';
import { SelectSriCategory } from './SelectSriCategory';
import { useProductCreateContext } from '../context/ProductFormContext';

export const ProductForm = () => {

    const { product, errorProduct, ivaTaxes, iceCataloges, transport } = useProductCreateContext();
    const {
        optionType, breakdown, total,
        handleChange, handleSelect, onChangeCheckbox, handleTotal
    } = useProductForm();

    return (
        <>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Código' value={product.code} error={errorProduct.code} onChange={handleChange} name='code' maxLength={25} required />
                    </div>
                    {(transport || product.iva === 5) && (
                        <div className='w-full'>
                            <div className='lg:w-2/3'>
                                <SelectSriCategory error={errorProduct.aux_cod} />
                            </div>
                        </div>
                    )}
                    <div className='lg:w-2/3'>
                        <SelectOption label="Tipo" name='type_product' options={optionType} selectedValue={product.type_product} handleSelect={handleSelect} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Nombre' value={product.name} error={errorProduct.name} onChange={handleChange} name='name' maxLength={300} required />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <input type='checkbox' checked={breakdown} onChange={onChangeCheckbox} /> ¿Necesitas desglosar el IVA?
                    </div>
                    <div className='lg:w-2/3'>
                        <LabelComponent name='price' label='Precio' required />
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
                            <SelectOption label="Imp. al ICE" name='ice' options={iceCataloges} selectedValue={product.ice ?? ''} handleSelect={handleSelect} />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
