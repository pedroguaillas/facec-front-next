"use client";

import { ProductProps } from '@/types';
import ModalSelectProduct from './ModalSelectProduct';
import { useSelectProduct } from './hooks/useSelectProduct';

interface Props {
    label?: string;
    error?: string;
    index: number;
    selectProduct: (index: number, product: ProductProps) => void;
}

export const SelectProduct = ({ label, error, index, selectProduct }: Props) => {

    const { search, suggestions, handleSelect, handleChange } = useSelectProduct(label, index, selectProduct);

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
                <ModalSelectProduct handleSelect={handleSelect} />
            </div>

            {suggestions.length > 0 && (
                <div
                    className="border border-gray-300 shadow-md w-full rounded-b max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {suggestions.map((product) => (
                        <div
                            key={product.id}
                            className="px-4 py-2 hover:bg-gray-100 hover:dark:bg-primary rounded cursor-pointer text-sm text-left"
                            onClick={() => handleSelect(product)}
                        >
                            {product.atts.code} - {product.atts.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
