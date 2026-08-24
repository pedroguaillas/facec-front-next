"use client";

import { LabelComponent, SelectOption, Separate, TextInput } from '@/components';
import { useProductForm } from '../hooks/useProductForm';
import { SelectSriCategory } from './SelectSriCategory';
import { useProductCreateContext } from '../context/ProductFormContext';

export const ProductForm = () => {

    const { product, errorProduct, ivaTaxes, iceCataloges, sriCategories, transport } = useProductCreateContext();
    const {
        optionType, breakdown, total,
        handleChange, handleSelect, onChangeCheckbox, handleTotal
    } = useProductForm();

    // Servicio no admite IVA 5% (categoría ferretería exclusiva de Producto)
    const ivaTaxOptions = product.type_product === 2
        ? ivaTaxes.filter((tax: { value: number | string }) => Number(tax.value) !== 5)
        : ivaTaxes;

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
                    {(transport || product.iva === 5 || (product.type_product === 2 && sriCategories.some(sc => sc.type === 'transporte'))) && (
                        <div className='w-full'>
                            <div className='lg:w-2/3'>
                                <SelectSriCategory
                                    initialLabel={sriCategories.findIndex(sc => sc.code === product.aux_cod) ? sriCategories.find(sc => sc.code === product.aux_cod)?.description : ''}
                                    error={errorProduct.aux_cod}
                                />
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
                        <div className='flex flex-col gap-1.5 my-2'>
                            <LabelComponent name='price' label='Precio' required />
                            <div className='flex flex-row'>
                                <input type='text' value={total} onChange={handleTotal} placeholder='Total' maxLength={15}
                                    className={`border rounded-l-lg px-3 py-2 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors border-[var(--border-strong)]
                                    ${breakdown ? 'block' : 'hidden'}`} />
                                <input type='number' value={product.price1} onChange={handleChange} name='price1'
                                    className={`border px-3 py-2 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors
                                    ${breakdown ? 'rounded-r-lg' : 'rounded-lg'}
                                    ${errorProduct.price1 ? 'border-red-400' : 'border-[var(--border-strong)]'}
                                    `} />
                            </div>
                            {errorProduct.price1 && <p className="text-xs text-red-500">{errorProduct.price1}</p>}
                        </div>
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
                        <SelectOption label="Imp. al IVA" name='iva' options={ivaTaxOptions} selectedValue={product.iva} handleSelect={handleSelect} />
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
