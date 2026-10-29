"use client";

import { LabelComponent, SelectOption, Separate, Switch, TextInput } from '@/components';
import { useProductForm } from '../hooks/useProductForm';
import { SelectSriCategory } from './SelectSriCategory';
import { useProductCreateContext } from '../context/ProductFormContext';
import { useInventory } from '@/lib/hooks/useInventory';
import Link from 'next/link';
import { PresentationsSection } from './PresentationsSection';
import { TemplateSection } from './TemplateSection';
import { UnitsSection } from './UnitsSection';
import { templateFieldsOf } from '@/helpers/productTemplateHelper';

export const ProductForm = () => {

    const { product, errorProduct, ivaTaxes, iceCataloges, sriCategories, transport, base8, isEdit, productTemplates, savedTemplateId } = useProductCreateContext();
    const { enabled: inventory } = useInventory();
    // El kardex solo lleva productos; los servicios (2) no tienen stock
    const showInventory = inventory && product.type_product === 1;
    // Modelo con campos por unidad (ej. moto con chasis): el stock lo dan sus unidades, no se ingresa
    const hasUnitFields = (templateId: number | null | undefined) =>
        templateFieldsOf(productTemplates.find(t => t.id === templateId), 'unidad').length > 0;
    const isUnitModel = hasUnitFields(product.product_template_id);
    // Unidades solo con la plantilla ya guardada (el backend las cuelga de esa)
    const showUnits = isEdit && product.type_product === 1 && !product.parent_product_id && savedTemplateId !== null && hasUnitFields(savedTemplateId);
    const {
        optionType, breakdown, total, ivaRate, canBreakdown,
        handleChange, handleSelect, onChangeCheckbox, handleTotal, toggleDifferentiatedIva
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
                    {(
                        (product.type_product === 1 && product.iva === 5 && sriCategories.some(sc => sc.type === 'ferreteria')) ||
                        (product.type_product === 2 && transport && sriCategories.some(sc => sc.type === 'transporte'))
                    ) && (
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
                        <SelectOption label="Tipo" name='type_product' options={optionType} selectedValue={product.type_product} error={errorProduct.type_product} handleSelect={handleSelect} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Nombre' value={product.name} error={errorProduct.name} onChange={handleChange} name='name' maxLength={300} required />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    {canBreakdown && (
                        <div className='lg:w-2/3'>
                            <Switch name="breakdown" label="Desglosar el IVA" description={`Ingresa el total con IVA (${ivaRate}%) y se calcula el precio sin impuesto`} checked={breakdown} onChange={onChangeCheckbox} />
                        </div>
                    )}
                    <div className='lg:w-2/3'>
                        <div className='flex flex-col gap-1.5 my-2'>
                            <LabelComponent name='price' label='Precio' required />
                            <div className='flex flex-row'>
                                <input type='text' value={total} onChange={handleTotal} placeholder='Total con IVA' maxLength={15} inputMode='decimal' aria-label='Total con IVA'
                                    className={`border rounded-l-lg px-3 py-2 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors border-[var(--border-strong)]
                                    ${breakdown ? 'block' : 'hidden'}`} />
                                <input type='text' inputMode='decimal' value={product.price1} onChange={handleChange} name='price1'
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

            <TemplateSection />

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
                {base8 && product.iva === 4 && (
                    <div className='w-full'>
                        <div className='lg:w-2/3'>
                            <Switch
                                name="differentiated_iva"
                                label="IVA diferenciado (8% en feriados)"
                                description="Servicio turístico: en los feriados nacionales se factura al 8% en vez del 15%"
                                checked={!!product.differentiated_iva}
                                onChange={toggleDifferentiatedIva}
                            />
                            {errorProduct.differentiated_iva && <p className="text-xs text-red-500">{errorProduct.differentiated_iva}</p>}
                        </div>
                    </div>
                )}
                {iceCataloges.length > 0 && (
                    <div className='w-full'>
                        <div className='lg:w-2/3'>
                            <SelectOption label="Imp. al ICE" name='ice' options={iceCataloges} selectedValue={product.ice ?? ''} handleSelect={handleSelect} />
                        </div>
                    </div>
                )}
            </div>

            {showInventory && (
                <>
                    <Separate />

                    <strong className='font-bold'>Inventario</strong>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='w-full'>
                            <div className='lg:w-2/3'>
                                {isEdit ? (
                                    <div className='flex flex-col gap-1.5 my-2'>
                                        <span className='text-sm font-medium'>Stock actual</span>
                                        <p className={`text-sm font-semibold tabular-nums ${Number(product.stock) < 0 ? 'text-sri-fail' : ''}`}>
                                            {product.stock === null || product.stock === undefined || product.stock === '' ? '—' : Number(product.stock).toLocaleString('es-EC', { maximumFractionDigits: 6 })}
                                        </p>
                                        <p className='text-xs text-ink-3'>
                                            Se modifica con <Link href={`/inventory/adjustments?product_id=${product.id}`} className='text-primary hover:underline'>ajustes de inventario</Link>
                                            {' · '}
                                            <Link href={`/inventory/kardex/${product.id}`} className='text-primary hover:underline'>Ver kardex</Link>
                                        </p>
                                    </div>
                                ) : isUnitModel ? (
                                    <div className='flex flex-col gap-1.5 my-2'>
                                        <span className='text-sm font-medium'>Stock inicial</span>
                                        <p className='text-xs text-ink-3'>Lo dan las unidades: cada una entra con stock 1.</p>
                                    </div>
                                ) : (
                                    <TextInput
                                        type='text'
                                        label='Stock inicial'
                                        name='stock'
                                        value={product.stock?.toString() ?? ''}
                                        error={errorProduct.stock}
                                        onChange={handleChange}
                                        inputMode='decimal'
                                        min='0'
                                        placeholder='0'
                                        hint='Entra al kardex como inventario inicial con costo 0. Para cargarlo con costo usa Inventario > Inventario inicial.'
                                    />
                                )}
                            </div>
                        </div>
                        <div className='w-full'>
                            <div className='lg:w-2/3'>
                                <TextInput
                                    type='text'
                                    label='Stock mínimo'
                                    name='min_stock'
                                    value={product.min_stock?.toString() ?? ''}
                                    error={errorProduct.min_stock}
                                    onChange={handleChange}
                                    inputMode='decimal'
                                    min='0'
                                    placeholder='Opcional'
                                    hint='Avisa en el inventario cuando el stock baja de este valor'
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Presentaciones (cubeta, caja...): solo con inventario, el stock se lleva en unidad base */}
            {showInventory && <PresentationsSection />}

            {showUnits && <UnitsSection />}
        </>
    )
}
