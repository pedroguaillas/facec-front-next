"use client";

import { getDate, getMinDate } from "@/helpers/dateHelper";
import { useSelectPoint } from '../hooks/useSelectPoint';
import { useFormShop } from "../context/FormShopContext";
import { SelectOption, TextInput } from '@/components';

export const RetentionInformation = () => {

    const { shop, errorShop, points, selectPoint, applieWithholding, setShop, setSelectPoint, setErrorShop, setApplieWithholding } = useFormShop();

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
        setSelectPoint(selectedPoint !== undefined ? selectedPoint : null);
        setErrorShop((prevState) => ({ ...prevState, serie_retencion: '' }))
    }

    return (
        <div className='py-2'>
            <div className='font-bold'>
                <label className='flex items-center gap-2' htmlFor="applieWithholding">
                    <input type="checkbox" name='applieWithholding' checked={applieWithholding} onChange={() => setApplieWithholding(!applieWithholding)} />
                    Aplicar Retención
                </label>
            </div>

            {applieWithholding && <div className='sm:flex gap-4'>

                {/* Col 1 */}
                {points.length > 1 && (
                    <div className='w-full'>
                        <div className="lg:w-2/3">
                            <SelectOption label="Punto Emi *" name='serie_retencion' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ""} error={errorShop.serie_retencion} handleSelect={handleSelectPoint} />
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
                        <TextInput type='date' label='Fecha emisión *' value={shop.date_retention ?? ''} error={errorShop.date_retention} onChange={handleChange} name='date_retention' min={shop.date ?? getMinDate()} max={getDate()} />
                    </div>
                </div>
            </div>}
        </div>
    )
}
