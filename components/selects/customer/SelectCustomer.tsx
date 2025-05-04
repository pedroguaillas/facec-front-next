"use client";

import { CustomerProps } from '@/types';
import ModalSelectCustomer from './ModalSelectCustomer';
import { ModalCreateCustomer } from './ModalCreateCustomer';
import { useSelectCustomer } from './hooks/useSelectCustomer';

interface Props {
    label?: string;
    error?: string;
    selectCustomer: (customer: CustomerProps) => void;
}

export const SelectCustomer = ({ label, error, selectCustomer }: Props) => {

    const { search, suggestions, handleChange, handleSelect } = useSelectCustomer(label, selectCustomer);

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
                <ModalSelectCustomer handleSelect={handleSelect} />
                <ModalCreateCustomer handleSelect={handleSelect} />
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
    );
};
