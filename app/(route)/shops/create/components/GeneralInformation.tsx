"use client";

import { SelectOption, SelectProvider, TextInput } from "@/components"
import { useCreateShop } from "../context/ShopCreateContext"
import { getDate, getMinDate } from "@/helpers/dateHelper";
import { SupplierProps } from "@/types";
import { ImportXml } from "./ImportXml";

export const GeneralInformation = () => {

    const { shop, errorShop, selectProvider, setShop, setErrorShop } = useCreateShop();

    const invoiceTypes = [
        { value: 1, label: 'Factura' },
        { value: 2, label: 'Nota Venta' },
        { value: 3, label: 'Liquidación en Compra' },
        { value: 5, label: 'Nota Débito' }
    ];

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setShop((prevState) => ({ ...prevState, [name]: value }))

        if (name in errorShop) {
            setErrorShop((prevState) => ({ ...prevState, [name]: '' }))
        }
    }

    const handleSelectProvider = (provider: SupplierProps) => {
        setShop((prevState) => ({ ...prevState, provider_id: provider.id }))

        if ('provider_id' in errorShop) {
            setErrorShop((prevState) => ({ ...prevState, provider_id: '' }))
        }
    }

    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='date' label='Fecha emisión' value={shop.date} error={errorShop.date} onChange={handleChange} name='date' min={getMinDate()} max={getDate()} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='N° de serie' value={shop.serie} error={errorShop.serie} onChange={handleChange} name='serie' maxLength={17} />
                    </div>
                    <div className='flex flex-col lg:w-2/3'>
                        <span>Proveedor</span>
                        <SelectProvider selectProvider={handleSelectProvider} label={selectProvider?.atts.name} error={errorShop.provider_id} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Autorización' value={shop.authorization} error={errorShop.authorization} onChange={handleChange} name='authorization' maxLength={49} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='flex gap-2 items-center'>
                        <SelectOption label="Tipo de comprobante" options={invoiceTypes} select={true} selectedValue={shop.voucher_type} error={errorShop.voucher_type} handleSelect={handleChange} name='voucher_type' />
                        <ImportXml />
                    </div>
                </div>
            </div>
        </div>
    )
}
