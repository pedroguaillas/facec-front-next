"use client";

import React, { useCallback, useState } from 'react';
import ModalSelectRetention from './ModalSelectRetention';
import { Tax, TaxInput } from '@/types';
import { useTaxes } from '../hooks/useTaxes';
import { useFormShop } from '../context/FormShopContext';
import { Autocomplete } from '@/components/selects/autocomplete/Autocomplete';

interface Props {
    index: number;
    tax: Tax;
    error?: string;
    disabled?: boolean;
}

const MAX_SUGGESTIONS = 30;

// Concepto de retención: se escribe código o texto y se elige de las sugerencias (filtra en memoria,
// los conceptos ya vienen con el formulario). La lista completa sigue en el modal (F2)
export const SelectRetention = ({ index, tax, error, disabled = false }: Props) => {

    const [modal, setModal] = useState(false);
    const [browseSearch, setBrowseSearch] = useState('');
    const { selectRetention } = useTaxes();
    const { taxInputs } = useFormShop();
    // 1 = renta, 2 = IVA
    const code = Number(tax.code);

    const fetchConcepts = useCallback(async (term: string) => {
        const search = term.toLowerCase();
        return taxInputs
            .filter(input => (code === 2 ? input.type === 'iva' : input.type === 'renta')
                && (input.code.includes(search) || input.conception.toLowerCase().includes(search)))
            .slice(0, MAX_SUGGESTIONS);
    }, [taxInputs, code]);

    const select = (taxInput: TaxInput) => {
        selectRetention(index, taxInput);
        setModal(false);
    };

    return (
        <div className='flex flex-col w-full min-w-0'>
            <Autocomplete<TaxInput>
                value={tax.tax_code ? (tax.tax_name ?? tax.tax_code) : ''}
                placeholder={tax.code === '' ? 'Elige el impuesto' : 'Código o concepto…'}
                ariaLabel={`Concepto de retención línea ${index + 1}`}
                error={error}
                disabled={tax.code === '' || disabled}
                fetchItems={fetchConcepts}
                getKey={(input) => `${input.type}-${input.code}`}
                renderItem={(input) => (
                    <div className="flex items-baseline gap-2">
                        <span className="shrink-0 text-xs text-ink-3 tabular-nums w-10">{input.code}</span>
                        <span className="flex-1 truncate" title={input.conception}>{input.conception}</span>
                        <span className="shrink-0 text-xs tabular-nums">{input.porcentage !== null ? `${input.porcentage}%` : 'Variable'}</span>
                    </div>
                )}
                onSelect={select}
                onBrowse={(term) => {
                    setBrowseSearch(term);
                    setModal(true);
                }}
                focusNextOnSelect
            />
            <ModalSelectRetention show={modal} code={code} initialSearch={browseSearch} selectRetetion={select} onClose={() => setModal(false)} />
        </div>
    )
}
