"use client";

import { SelectOption, TextInput } from '@/components';
import { useCreateShop } from '../context/ShopCreateContext'
import { useState } from 'react';
import { EmisionPoint } from '@/types';

export const RetentionInformation = () => {

    const { shop, points, errorShop, setShop } = useCreateShop();
    const [selectPoint, setSelectPoint] = useState<EmisionPoint | undefined>(undefined);

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShop((prevState) => ({ ...prevState, [event.target.name]: event.target.value }))
    }

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        if (selectedPoint) {
            setSelectPoint(selectPoint)
            setShop((prevState) => ({ ...prevState, serie_retencion: `${selectedPoint.store}-${selectedPoint.point}-${(selectedPoint.retention + '').padStart(9, '0')}` }))
        }
    }

    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos de la retención</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    {points.length > 1 && (
                        <div className="lg:w-2/3">
                            <SelectOption label="Punto Emi" name='serie_retencion' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ""} error={errorShop.serie_retencion} handleSelect={handleSelectPoint} />
                        </div>
                    )}
                </div>

                {/* Col 2 */}
                <div className='lg:w-full flex items-center'>
                    <div className="lg:w-2/3">
                        <span className='font-semibold'>Serie ret: </span>{shop.serie_retencion}
                    </div>
                </div>

                {/* Col 3 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='date' label='Fecha emisión' value={shop.date_retention} error={errorShop.date_retention} onChange={handleChange} name='date_retention' />
                    </div>
                </div>
            </div>
        </div>
    )
}
