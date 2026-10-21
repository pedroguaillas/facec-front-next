"use client";

import { getDate, getMinDate } from "@/helpers/dateHelper";
import { useShopVoucherType } from '../hooks/useShopVoucherType';
import { useFormShop } from "../context/FormShopContext";
import { Switch, TextInput } from '@/components';
import { nanoid } from 'nanoid';
import { FormSection } from '../../orders/shared/FormSection';
import { ListTaxes } from './ListTaxes';

// SRI: código de retención de renta fijo para compras registradas como
// Nota de Venta (no emite factura, así que solo cabe retención de renta).
const NOTA_VENTA_RETENTION_CODE = '332';

export const RetentionInformation = () => {

    const { shop, errorShop, taxes, taxInputs, applieWithholding, setShop, setErrorShop, setApplieWithholding, setTaxes } = useFormShop();
    const { isNotaVenta } = useShopVoucherType();

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

    const retained = taxes.reduce((acc, tax) => acc + (Number(tax.value) || 0), 0);

    return (
        <FormSection
            title='Retención'
            aside={applieWithholding && retained > 0 ? <span className='text-xs text-ink-3'>Retienes <span className='font-medium tabular-nums text-ink-1'>${retained.toFixed(2)}</span></span> : undefined}
        >
            <Switch
                name="applieWithholding"
                label="Emitir comprobante de retención"
                description={applieWithholding
                    ? (isNotaVenta ? 'Nota de venta: solo retención de renta, código 332.' : 'Se emite al SRI junto con la compra.')
                    : 'Actívalo si eres agente de retención o la compra lo requiere.'}
                checked={applieWithholding}
                onChange={handleToggleWithholding}
            />

            {applieWithholding && (
                <>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 mt-2'>
                        <TextInput type='date' label='Fecha de la retención' value={shop.date_retention ?? ''} error={errorShop.date_retention} onChange={handleChange} name='date_retention' min={shop.date ?? getMinDate()} max={getDate()} hint='Desde la fecha de la compra hasta hoy' required />
                    </div>
                    <ListTaxes />
                </>
            )}
        </FormSection>
    )
}
