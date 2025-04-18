"use client";

import { FaSave } from 'react-icons/fa';

export const ButtonSubmit = () => {

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // Aquí puedes manejar el envío del formulario
        console.log('Formulario enviado');
    };

    return (
        <div className='flex justify-end mt-4'>
            <button onClick={handleSubmit} className="btn btn-primary flex items-center gap-2 bg-primary hover:bg-primary-focus text-white p-2 rounded-md cursor-pointer">
                <FaSave /> Guardar y procesar
            </button>
        </div>
    )
}
