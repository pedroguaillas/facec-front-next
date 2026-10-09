"use client";

import { getDate, getMinDate } from "@/helpers/dateHelper";
import { useSelectPoint } from '../hooks/useSelectPoint';
import { useShopVoucherType } from '../hooks/useShopVoucherType';
import { useFormShop } from "../context/FormShopContext";
import { SelectOption, Switch, TextInput } from '@/components';
import { nanoid } from 'nanoid';

// SRI: código de retención de renta fijo para compras registradas como
// Nota de Venta (no emite factura, así que solo cabe retención de renta).
const NOTA_VENTA_RETENTION_CODE = '332';

export const RetentionInformation = () => {

    const { shop, errorShop, points, taxes, taxInputs, selectPoint, applieWithholding, setShop, setSelectPoint, setErrorShop, setApplieWithholding, setTaxes } = useFormShop();
    const { isNotaVenta } = useShopVoucherType();

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

    const handleToggleWithholding = () => {
        const next = !applieWithholding;
        setApplieWithholding(next);

        // Nota de Venta solo admite retención de renta, código 332: se
        // autorellena la línea en vez de pedir al usuario que la busque.
        // El estado inicial siempre trae una fila en blanco (no length 0),
        // así que sobreescribimos directo en vez de chequear si está vacío;
        // se preserva la base si ya había algo tipeado (ej. al retildar).
        if (next && isNotaVenta) {
            const retencion332 = taxInputs.find((t) => t.code === NOTA_VENTA_RETENTION_CODE && t.type === 'renta');
            if (retencion332) {
                const existingBase = taxes[0]?.base ?? '';
                const value = existingBase !== '' && retencion332.porcentage !== null
                    ? Number((Number(retencion332.porcentage) * Number(existingBase) * 0.01).toFixed(2))
                    : 0;
                setTaxes([{
                    id: taxes[0]?.id ?? nanoid(),
                    code: '1',
                    tax_code: retencion332.code,
                    porcentage: retencion332.porcentage,
                    editable_porcentage: retencion332.porcentage === null,
                    base: existingBase,
                    value,
                    tax_name: retencion332.conception,
                }]);
            }
        }
    }

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        setSelectPoint(selectedPoint !== undefined ? selectedPoint : null);
        setErrorShop((prevState) => ({ ...prevState, serie_retencion: '' }))
    }

    return (
        <div className='py-2'>
            <Switch name="applieWithholding" label="Aplicar retención" checked={applieWithholding} onChange={handleToggleWithholding} />

            {applieWithholding && <div className='sm:flex gap-4'>

                {/* Col 1 */}
                {points.length > 1 && (
                    <div className='w-full'>
                        <div className="lg:w-2/3">
                            <SelectOption label="Punto Emi" name='serie_retencion' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ""} error={errorShop.serie_retencion} handleSelect={handleSelectPoint} required />
                        </div>
                    </div>
                )}

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='lg:w-2/3 mx-auto'>
                        <TextInput type='date' label='Fecha emisión' value={shop.date_retention ?? ''} error={errorShop.date_retention} onChange={handleChange} name='date_retention' min={shop.date ?? getMinDate()} max={getDate()} required />
                    </div>
                </div>
            </div>}
        </div>
    )
}
