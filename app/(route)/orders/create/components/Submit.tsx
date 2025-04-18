"use client";

import { useCreateInvoice } from '../../context/InvoiceCreateContext';
import { FaSave } from 'react-icons/fa';

export const ButtonSubmit = () => {
    const { invoice, selectPoint, productOutputs, aditionalInformation } = useCreateInvoice();

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // Aquí puedes manejar el envío del formulario
        const form = {
            ...invoice,
            products:
                productOutputs.length > 0
                    ? productOutputs.filter((product: ProductOutput) => product.product_id !== 0)
                    : [],
            send: true,
            aditionals: aditionalInformation,
            point_id: selectPoint?.id,
        };

        console.log(form)

        //   try {
        //     // document.getElementById('btn-save').disabled = true;

        //     invoice.point_id = selectPoint.id
        //       await api
        //         .post('orders', form)
        //         .then((res) => this.props.history.push('/ventas/facturas'));
        //   } catch (error) {
        //     console.log(error);
        //   }
        console.log('Formulario enviado');
    };

    return (
        <div className='flex justify-end mt-4'>
            <button onClick={handleSubmit} id='btn-save' className="btn btn-primary flex items-center gap-2 bg-primary hover:bg-primary-focus text-white p-2 rounded-md cursor-pointer">
                <FaSave /> Guardar y procesar
            </button>
        </div>
    )
}
