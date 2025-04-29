import { Modal } from '@/components/modal/Modal';
import React, { useState } from 'react'
import { FaPlusCircle } from 'react-icons/fa';

export const ModalCreateCustomer = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const toogle = () => {
        setIsOpen(!isOpen)
    }
    return (
        <>
            <button
                onClick={toogle}
                className='rounded-r p-2 bg-primary text-white cursor-pointer'>
                <FaPlusCircle />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={toogle}
                title="Registrar un nuevo cliente"
                modalSize="lg"
            >
                <h1>Saludos</h1>
            </Modal>
        </>
    )
}
