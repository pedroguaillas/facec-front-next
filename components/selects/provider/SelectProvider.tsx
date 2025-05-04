"use client";

import { SupplierProps } from '@/types';
import ModalSelectProvider from './ModalSelectProvider';
import { useSelectProvider } from './hooks/useSelectProvider';

interface Props {
    label?: string;
    error?: string;
    selectProvider: (provider: SupplierProps) => void;
}

export const SelectProvider = ({ label, error, selectProvider }: Props) => {

    const { search, suggestions, handleChange, handleSelect } = useSelectProvider(label, selectProvider);

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
                <ModalSelectProvider handleSelect={handleSelect} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {suggestions.length > 0 && (
                <div
                    className="border border-gray-300 shadow-md w-full rounded-b max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {suggestions.map((customer) => (
                        <div
                            key={customer.id}
                            className="px-4 py-2 hover:bg-gray-100 hover:dark:bg-primary rounded cursor-pointer text-sm text-left"
                            onClick={() => handleSelect(customer)}
                        >
                            {customer.atts.identication} - {customer.atts.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
