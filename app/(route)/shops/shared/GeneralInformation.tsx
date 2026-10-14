"use client";

import { useGeneralInformation } from "../hooks/useGeneralInformation";
import { LabelComponent, SelectOption, SelectProvider, TextInput } from "@/components"
import { getDate, getMinDate } from "@/helpers/dateHelper";
import { useFormShop } from "../context/FormShopContext";
import { FormSection } from "../../orders/shared/FormSection";
import { ImportXml } from "./ImportXml";

// "001001000000123" → "001-001-000000123" mientras se escribe
const formatSerie = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join('-');
};

export const GeneralInformation = () => {

    const { invoiceTypes, isLiquidacion, isFactura, handleChange, handleSelectProvider } = useGeneralInformation();
    const { shop, errorShop, selectProvider, points, selectPoint, setShop, setSelectPoint, setErrorShop } = useFormShop();

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        setSelectPoint(selectedPoint !== undefined ? selectedPoint : null);
        setErrorShop(prev => ({ ...prev, serie: '' }));
    }

    const handleSerie = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShop(prev => ({ ...prev, serie: formatSerie(event.target.value) }));
        setErrorShop(prev => ({ ...prev, serie: '' }));
    }

    const handleAuthorization = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShop(prev => ({ ...prev, authorization: event.target.value.replace(/\D/g, '') }));
        setErrorShop(prev => ({ ...prev, authorization: '' }));
    }

    return (
        <FormSection
            title="Comprobante"
            // Factura electrónica: el XML del SRI llena serie, autorización, fecha, proveedor y valores
            aside={isFactura ? <ImportXml /> : undefined}
        >
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6'>
                <SelectOption label="Tipo de comprobante" options={invoiceTypes} selectedValue={shop.voucher_type_id} error={errorShop.voucher_type_id} handleSelect={handleChange} name='voucher_type_id' />
                <TextInput type='date' label='Fecha de emisión' value={shop.date} error={errorShop.date} onChange={handleChange} name='date' min={getMinDate()} max={getDate()} required />

                <div className='flex flex-col gap-1.5 my-2 sm:col-span-2'>
                    <LabelComponent name="provider_id" label="Proveedor" required />
                    <SelectProvider selectProvider={handleSelectProvider} label={selectProvider?.atts.name} error={errorShop.provider_id} />
                </div>

                {/* La liquidación la emite la empresa: el número sale del punto de emisión */}
                {isLiquidacion && points.length > 1 && (
                    <SelectOption label="Punto de emisión" name='emision_point_id' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ''} error={errorShop.serie} handleSelect={handleSelectPoint} required />
                )}

                {!isLiquidacion && (
                    <>
                        <TextInput
                            label='N.º de comprobante'
                            value={shop.serie ?? ''}
                            error={errorShop.serie}
                            onChange={handleSerie}
                            name='serie'
                            maxLength={17}
                            inputMode='numeric'
                            placeholder='001-001-000000001'
                            className='font-mono tabular-nums'
                            required
                        />
                        <TextInput
                            label='Autorización'
                            value={shop.authorization}
                            error={errorShop.authorization}
                            onChange={handleAuthorization}
                            name='authorization'
                            maxLength={49}
                            inputMode='numeric'
                            placeholder='Clave de acceso de 49 dígitos'
                            className='font-mono tabular-nums'
                            showCount
                            required
                        />
                    </>
                )}
            </div>
        </FormSection>
    )
}
