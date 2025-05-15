"use client";

import { useSelectCarrier } from './hooks/useSelectCarrier';
import { ModalSelectCarrier } from './ModalSelectCarrier';
import { CarrierProps } from '@/types';
import React from 'react'

interface Props {
    label?: string;
    error?: string;
    selectCarrier: (carrier: CarrierProps) => void;
}

export const SelectCarrier = ({ label, error, selectCarrier }: Props) => {
    const { search, suggestions, handleChange, handleSelect } = useSelectCarrier(label, selectCarrier);
    return (
        <div className='flex flex-col w-full'>
            <div className='flex w-full'>
                <input
                    onChange={handleChange}
                    value={search}
                    placeholder='...'
                    className={`w-full border border-primary hover:border-primaryhover rounded-l px-2
                            ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-400 focus:ring-blue-500'}`}
                    type='text'
                />

                <ModalSelectCarrier handleSelect={selectCarrier} />
            </div>

            {suggestions.length > 0 && (
                <div
                    className='border border-gray-300 shadow-md w-full rounded-b max-h-60 overflow-y-auto'
                    onClick={(e) => e.stopPropagation()}
                >
                    {suggestions.map((carrier) => (
                        <div
                            key={carrier.id}
                            className='px-4 py-2 hover:bg-gray-100 hover:dark:bg-primary rounded cursor-pointer text-sm text-left'
                            onClick={() => handleSelect(carrier)}
                        >
                            {carrier.atts.identication} - {carrier.atts.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
