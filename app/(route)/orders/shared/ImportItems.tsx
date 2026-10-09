"use client";

import { useFormInvoice } from '../context/FormInvoiceContext';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { PrimaryButton } from '@/components'
import { calculateInvoiceTotals, calculateLineTotal } from '@/helpers/invoiceTotalsHelper';
import { handleApiRequest } from '@/helpers/apiHandler';
import { useToast } from '@/context/ToastContext';
import { ProductOutput } from '@/types';
import React, { useRef } from 'react'
import { nanoid } from 'nanoid';

interface ImportedItems {
    orderItems: ProductOutput[];
    // Códigos del CSV que no existen en la empresa
    not_found?: string[];
}

// Importa items desde un CSV "codigo;precio;cantidad" (la primera línea es cabecera)
export const ImportItems = () => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const { applyHolidayIva, setInvoice, setProductOutputs } = useFormInvoice();

    const handleExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => uploadCsv(reader.result as string);
        reader.readAsText(file);
        // Permite volver a elegir el mismo archivo
        input.value = '';
    }

    const uploadCsv = (csv: string) => {
        const prods = csv.split(/\r\n|\n/)
            .slice(1)
            .filter(line => line.trim().length > 0)
            .map(line => {
                const words = line.split(';');
                return {
                    code: words[0]?.trim() ?? '',
                    price: words[1]?.trim() ?? '',
                    quantity: words[2]?.trim() ?? '',
                };
            });
        getMasive(prods);
    };

    const getMasive = async (prods: { code: string, price: string, quantity: string }[]) => {
        const { data, error } = await handleApiRequest<ImportedItems>(() => axiosAuth.post('products/getmasive', { prods }));
        if (!data) {
            toast(error ?? 'No se pudo importar el archivo', 'error');
            return;
        }

        // ids propios para la tabla y total de línea con la misma fórmula del formulario
        const items = applyHolidayIva(data.orderItems.map(item => ({ ...item, id: nanoid(), total_iva: calculateLineTotal(item) })));
        setProductOutputs(items);
        setInvoice(prev => ({ ...prev, ...calculateInvoiceTotals(items) }));

        if (data.not_found?.length) {
            toast(`No se encontraron: ${data.not_found.join(', ')}`, 'error');
        }
    };

    return (
        <>
            <div>
                <PrimaryButton label='Importar' type='button' action='import' onClick={() => inputRef.current?.click()} />
            </div>
            <input ref={inputRef} type="file" onChange={handleExcel} className="hidden" accept=".csv" />
        </>
    )
}
