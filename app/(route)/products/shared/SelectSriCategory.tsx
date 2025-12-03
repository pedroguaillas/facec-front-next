"use client";

import { FaSearch } from 'react-icons/fa';
import React, { useState } from 'react';
import { SriCategory } from '@/types';
import SelectModalSriCategory from './SelectModalSriCategory';
import { useProductCreateContext } from '../context/ProductFormContext';
import { LabelComponent } from '@/components';

interface Props {
    error?: string;
}

export const SelectSriCategory = ({ error }: Props) => {

    const [label, setlabel] = useState('');
    const [modal, setModal] = useState<boolean>(false);
    const { setProduct } = useProductCreateContext();

    const toggle = () => {
        setModal(!modal);
    }

    const selectSriCategory = (sriCategory: SriCategory) => {
        setProduct(prevState => ({ ...prevState, aux_cod: sriCategory.code }))
        setlabel(sriCategory.description);
        toggle();
    }

    return (
        <div className='flex flex-col w-full'>
            <LabelComponent label='Categoría / Código auxiliar' name='sri_category_id' required />
            <div className='flex w-full'>
                <input
                    type='text'
                    value={label}
                    readOnly={true}
                    placeholder='...'
                    className={`w-full border border-primary hover:border-primaryhover rounded-l px-2
                                  ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-400 focus:ring-blue-500'}`}
                />
                <button
                    onClick={toggle}
                    /* disabled={sriCategory.code === ''} */
                    className='rounded-r p-2 bg-primary text-white cursor-pointer'
                >
                    <FaSearch />
                </button>
                <SelectModalSriCategory show={modal} selectSriCategory={selectSriCategory} onClose={toggle} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
