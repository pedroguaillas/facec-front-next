import { useFormInvoice } from '../context/FormInvoiceContext';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { PrimaryButton } from '@/components'
import React from 'react'

export const ImportItems = () => {

    const axiosAuth = useAxiosAuth();
    const { setProductOutputs } = useFormInvoice();

    const handleImport = () => {
        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
    }

    const handleExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const reader = new FileReader();

        reader.onload = () => uploadCsv(reader.result as string);
        reader.readAsText(input.files?.[0] as Blob);
    }

    const uploadCsv = (csv: string) => {
        const lines = csv.split(/\r\n|\n/);
        const productinputs = [];
        let i = 0;

        // Extraer los codigos, precios y cantidades
        for (const line in lines) {
            if (i > 0 && lines[line].length > 0) {
                const words = lines[line].split(';');
                const object = {
                    code: words[0].trim(),
                    price: words[1].trim(),
                    quantity: words[2],
                };
                productinputs.push(object);
            }
            i++;
        }
        getMasive(productinputs);
    };

    const getMasive = async (prods: unknown) => {
        const data = { prods };

        try {
            // Enviar a traer solo esos productos
            const response = await axiosAuth.post('products/getmasive', data);
            const { orderItems } = response.data;
            setProductOutputs(orderItems);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div>
                <PrimaryButton label='Importar' type='button' action='import' onClick={handleImport} />
            </div>
            <input type="file" onChange={handleExcel} className="hidden" accept=".csv" />
        </>
    )
}
