"use client";

import Link from "next/link";
import { SelectOption, Separate } from "@/components";
import { templateFieldsOf } from "@/helpers/productTemplateHelper";
import { useProductCreateContext } from "../context/ProductFormContext";
import { TemplateDetailInput } from "./TemplateDetailInput";

// Plantilla de características (ej. Moto): los campos de nivel "modelo" se llenan aquí;
// los de nivel "unidad" (chasis, motor) van en cada unidad (UnitsSection)
export const TemplateSection = () => {

    const { product, errorProduct, productTemplates, characteristics, setProduct, setErrorProduct } = useProductCreateContext();
    const errors = errorProduct as Record<string, string>;

    // Una unidad hereda las características del modelo: solo se muestran
    if (product.parent_product_id) {
        if (characteristics.length === 0) return null;
        return (
            <>
                <Separate />
                <strong className='font-bold'>Características</strong>
                <dl className='mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm'>
                    {[...characteristics].sort((a, b) => a.sort - b.sort).map(c => (
                        <div key={c.label}>
                            <dt className='text-xs text-ink-3'>{c.label}</dt>
                            <dd className='font-medium text-ink-1'>{c.value || '—'}</dd>
                        </div>
                    ))}
                </dl>
                <p className='text-xs text-ink-3 mt-2'>
                    Es una unidad de <Link href={`/products/${product.parent_product_id}`} className='text-primary hover:underline'>su modelo</Link>: las características se corrigen desde ahí.
                </p>
            </>
        );
    }

    const templateId = product.product_template_id ?? null;
    if (productTemplates.length === 0 && templateId === null) return null;

    const template = productTemplates.find(t => t.id === templateId);
    const modelFields = templateFieldsOf(template, 'modelo');
    const hasUnits = templateFieldsOf(template, 'unidad').length > 0;

    const options = [
        { value: '', label: 'Sin plantilla' },
        ...productTemplates.map(t => ({ value: t.id, label: t.name })),
        // Plantilla desactivada que el producto conserva
        ...(templateId !== null && !template ? [{ value: templateId, label: 'Plantilla desactivada' }] : []),
    ];

    const handleTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProduct(prev => ({ ...prev, product_template_id: e.target.value ? Number(e.target.value) : null }));
        setErrorProduct(prev => ({ ...prev, product_template_id: '' }));
    };

    const handleDetail = (key: string, value: string) => {
        setProduct(prev => ({ ...prev, details: { ...prev.details, [key]: value } }));
        setErrorProduct(prev => ({ ...prev, [`details.${key}`]: '' }));
    };

    return (
        <>
            <Separate />
            <strong className='font-bold'>Características</strong>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4'>
                <div className='lg:w-2/3'>
                    <SelectOption label="Plantilla" name='product_template_id' options={options} selectedValue={templateId ?? ''} error={errors.product_template_id} handleSelect={handleTemplate} />
                </div>
            </div>
            {modelFields.length > 0 && (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4'>
                    {modelFields.map(field => (
                        <div key={field.key} className='lg:w-2/3'>
                            <TemplateDetailInput field={field} value={product.details?.[field.key] ?? ''} error={errors[`details.${field.key}`]} onChange={handleDetail} />
                        </div>
                    ))}
                </div>
            )}
            {hasUnits && product.type_product === 1 && (
                <p className='text-xs text-ink-3 mt-1'>
                    {templateFieldsOf(template, 'unidad').map(f => f.label).join(', ')}: se registran por unidad, en la sección Unidades, después de guardar. El stock lo dan las unidades.
                </p>
            )}
        </>
    );
};
