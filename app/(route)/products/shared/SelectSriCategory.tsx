"use client";

import { FaSearch } from 'react-icons/fa';
import React, { useState } from 'react';
import { SriCategory } from '@/types';
import SelectModalSriCategory from './SelectModalSriCategory';
import { useProductCreateContext } from '../context/ProductFormContext';
import { LabelComponent } from '@/components';

interface Props {
    initialLabel?: string;
    error?: string;
}

export const SelectSriCategory = ({ initialLabel = '', error }: Props) => {

    const [search, setSearch] = useState(initialLabel);
    const [modal, setModal] = useState<boolean>(false);
    const { product, setProduct } = useProductCreateContext();

    const toggle = () => {
        setModal(!modal);
    }

    const selectSriCategory = (sriCategory: SriCategory) => {
        setProduct(prevState => ({ ...prevState, aux_cod: sriCategory.code }))
        setSearch(sriCategory.description);
        toggle();
    }

    return (
        <div className='flex flex-col w-full gap-1.5 my-2'>
            <LabelComponent label='Categoría / Código auxiliar' name='sri_category_id' required={product.iva === 5} />
            <button
                type="button"
                onClick={toggle}
                className={`
                    w-full flex items-center justify-between
                    border rounded-lg px-3 py-2 text-sm text-left
                    transition-colors duration-150 cursor-pointer
                    bg-[var(--background)] dark:text-gray-300
                    ${error ? 'border-red-400' : 'border-[var(--border-strong)] hover:border-primary'}
                `}
            >
                <span className={search ? 'text-[var(--foreground)]' : 'opacity-40'}>
                    {search || 'Seleccionar categoría...'}
                </span>
                <FaSearch className="text-xs opacity-40 shrink-0 ml-2" />
            </button>
            <SelectModalSriCategory show={modal} selectSriCategory={selectSriCategory} onClose={toggle} />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
