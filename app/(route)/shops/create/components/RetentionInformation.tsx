"use client";

import { useCreateShop } from '../context/ShopCreateContext'
import { SelectOption, TextInput } from '@/components';
import { EmisionPoint } from '@/types';
import { useState } from 'react';
import { useSelectPoint } from '../hooks/useSelectPoint';

export const RetentionInformation = () => {

    const { shop, points, errorShop, setShop, setErrorShop } = useCreateShop();
    const [selectPoint, setSelectPoint] = useState<EmisionPoint | undefined>(undefined);

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    // Solo le llamo a este Hooks para que se ejecute el useEffect que tiene dentro
    useSelectPoint();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setShop((prevState) => ({ ...prevState, [name]: value }))
        setErrorShop((prevState) => ({ ...prevState, [name]: '' }))
    }

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        if (selectedPoint) {
            setSelectPoint(selectedPoint)
            setShop((prevState) => ({
                ...prevState,
                serie_retencion: `${selectedPoint.store}-${selectedPoint.point}-${(selectedPoint.retention + '').padStart(9, '0')}`
            }))
            setErrorShop((prevState) => ({ ...prevState, serie_retencion: '' }))
        }
    }

    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos de la retención</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                {points.length > 1 && (
                    <div className='w-full'>
                        <div className="lg:w-2/3">
                            <SelectOption label="Punto Emi" name='serie_retencion' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ""} error={errorShop.serie_retencion} handleSelect={handleSelectPoint} />
                        </div>
                    </div>
                )}

                {/* Col 2 */}
                <div className='w-full flex items-center'>
                    <div className="lg:w-2/3 mx-auto">
                        <span className='font-semibold'>Serie ret: </span>{shop.serie_retencion}
                    </div>
                </div>

                {/* Col 3 */}
                <div className='w-full'>
                    <div className='lg:w-2/3 mx-auto'>
                        <TextInput type='date' label='Fecha emisión' value={shop.date_retention} error={errorShop.date_retention} onChange={handleChange} name='date_retention' />
                    </div>
                </div>
            </div>
        </div>
    )
}
