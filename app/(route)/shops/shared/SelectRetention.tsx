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
    disabled?: boolean;
}

export const SelectRetention = ({ index, tax, error, disabled = false }: Props) => {

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
                disabled={tax.code === '' || disabled}
                className={`
                    w-full flex items-center justify-between min-w-0
                    border rounded-md px-2 py-1.5 text-sm text-left
                    transition-colors duration-150 cursor-pointer
                    bg-[var(--background)] text-ink-1
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? 'border-red-400' : 'border-[var(--border-strong)] hover:border-primary'}
                `}
            >
                <span className={`truncate ${label ? '' : 'text-ink-4'}`} title={label || undefined}>
                    {label || (tax.code === '' ? 'Elige el impuesto' : 'Buscar concepto…')}
                </span>
                <FaSearch className="text-xs opacity-40 shrink-0 ml-2" />
            </button>
            <ModalSelectRetention show={modal} code={Number(tax.code)} selectRetetion={selectRetetion} onClose={toggle} />
        </div>
    )
}
