"use client";

import { TextInput } from '@/components';
import { useCreateShop } from '../context/ShopCreateContext'

export const RetentionInformation = () => {

    const { shop, errorShop, setShop } = useCreateShop();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShop((prevState) => ({ ...prevState, [event.target.name]: event.target.value }))
    }

    // const optionPoints = points.map((point) => ({
    //     value: point.id,
    //     label: `${point.store} - ${point.point} - ${point.recognition}`
    // }));

    return (
        <div className='py-2'>
            <strong className='font-bold'>Datos de la retención</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='date' label='Fecha emisión' value={shop.date_retention} error={errorShop.date_retention} onChange={handleChange} name='date_retention' />
                    </div>
                </div>
            </div>
        </div>
    )
}
