"use client";

import { FaSearch } from 'react-icons/fa';
import React, { useState } from 'react';
import ModalSelectRetention from './ModalSelectRetention';
import { Tax, TaxInput } from '@/types';
import { useTaxes } from '../hooks/useTaxes';

interface Props {
    index: number;
    tax: Tax;
    error?: string;
}

export const SelectRetention = ({ index, tax, error }: Props) => {

    const [label, setlabel] = useState('');
    const [modal, setModal] = useState<boolean>(false);
    const { selectRetention } = useTaxes();

    const toggle = () => {
        setModal(!modal);
    }

    const selectRetetion = (taxInput: TaxInput) => {
        selectRetention(index, taxInput)
        setlabel(taxInput.conception);
        toggle();
    }

    return (
        <div className='flex flex-col w-full'>
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
                    disabled={tax.code === ''}
                    className='rounded-r p-2 bg-primary text-white cursor-pointer'
                >
                    <FaSearch />
                </button>
                <ModalSelectRetention show={modal} code={Number(tax.code)} selectRetetion={selectRetetion} onClose={toggle} />
            </div>
        </div>
    )
}
