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

    const [label, setlabel] = useState(tax.tax_name || '');
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
            <button
                type="button"
                onClick={toggle}
                disabled={tax.code === ''}
                className={`
                    w-full flex items-center justify-between
                    border rounded-md px-2 py-1.5 text-sm text-left
                    transition-colors duration-150 cursor-pointer
                    bg-[var(--background)] dark:text-gray-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? 'border-red-400' : 'border-[var(--border-strong)] hover:border-primary'}
                `}
            >
                <span className={label ? 'text-[var(--foreground)]' : 'opacity-40'}>
                    {label || 'Seleccionar...'}
                </span>
                <FaSearch className="text-xs opacity-40 shrink-0 ml-2" />
            </button>
            <ModalSelectRetention show={modal} code={Number(tax.code)} selectRetetion={selectRetetion} onClose={toggle} />
        </div>
    )
}
