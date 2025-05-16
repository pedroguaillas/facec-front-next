"use client";

import { useGeneralInformation } from "../hooks/useGeneralInformation";
import { SelectOption, SelectProvider, TextInput } from "@/components"
import { getDate, getMinDate } from "@/helpers/dateHelper";
import { useFormShop } from "../context/FormShopContext";
import { VoucherType } from "@/constants";
import { ImportXml } from "./ImportXml";
export const GeneralInformation = () => {

    const { invoiceTypes, handleChange, handleSelectProvider } = useGeneralInformation();
    const { shop, errorShop, selectProvider, points, selectPoint, setSelectPoint, setErrorShop } = useFormShop();

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        setSelectPoint(selectedPoint !== undefined ? selectedPoint : null);
        setErrorShop(prev => ({ ...prev, serie: '' }));
    }

    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='date' label='Fecha emisión *' value={shop.date} error={errorShop.date} onChange={handleChange} name='date' min={getMinDate()} max={getDate()} />
                    </div>
                    {Number(shop.voucher_type) === VoucherType.LIQUIDATION && points.length > 1 && (
                        <>
                            <div className="flex flex-col lg:w-2/3">
                                <SelectOption label="Punto Emi *" name='emision_point_id' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ''} error={errorShop.serie} handleSelect={handleSelectPoint} />
                            </div>
                        </>
                    )}

                    {Number(shop.voucher_type) === VoucherType.LIQUIDATION && <div className='py-2'><span>N° de serie: </span>{shop.serie}</div>}

                    {Number(shop.voucher_type) !== VoucherType.LIQUIDATION && (<div className='lg:w-2/3'>
                        <TextInput type='text' label='N° de serie' value={shop.serie} error={errorShop.serie} onChange={handleChange} name='serie' maxLength={17} />
                    </div>)}
                    <div className='flex flex-col lg:w-2/3'>
                        <span>Proveedor *</span>
                        <SelectProvider selectProvider={handleSelectProvider} label={selectProvider?.atts.name} error={errorShop.provider_id} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Autorización' value={shop.authorization} error={errorShop.authorization} onChange={handleChange} name='authorization' maxLength={49} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='flex gap-2 items-end'>
                        <SelectOption label="Tipo de comprobante" options={invoiceTypes} selectedValue={shop.voucher_type} error={errorShop.voucher_type} handleSelect={handleChange} name='voucher_type' />
                        {Number(shop.voucher_type) === VoucherType.INVOICE && <ImportXml />}
                    </div>
                </div>
            </div>
        </div>
    )
}
