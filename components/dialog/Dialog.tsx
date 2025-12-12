"use client";

import React, { useEffect, useState } from 'react'
import { Modal } from '../modal/Modal';
import { PrimaryButton } from '../primary-button/PrimaryButton';

interface Props {
    itemId: number | null;
    title: string;
    sutTitle: string;
    confirmation: (accept: boolean) => void;
}

export const Dialog = ({ itemId, confirmation, title, sutTitle }: Props) => {

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(itemId !== null);
    }, [itemId]);

    return (
        <Modal
            isOpen={isOpen}
            modalSize="sm"
            onClose={() => setIsOpen(false)}
            title=""
        >
            <div className="flex flex-col items-center gap-6 p-4 text-center">

                {/* Icono de advertencia */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 animate-pulse">
                    <svg
                        className="w-10 h-10 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.662 1.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16c-.77 1.338.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Texto */}
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                    {sutTitle}
                </p>

                {/* Botones */}
                <div className="flex w-full gap-4 mt-4">
                    <PrimaryButton
                        type="button"
                        label="Sí, eliminar"
                        action="delete"
                        onClick={() => confirmation(true)}
                    />
                    <PrimaryButton
                        type="button"
                        label="Cancelar"
                        action="store"
                        onClick={() => setIsOpen(false)}
                    />
                </div>
            </div>
        </Modal>
    )
}
