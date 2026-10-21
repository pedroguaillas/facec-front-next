"use client";

import { CarrierProps, GeneralPaginate } from '@/types';
import { useModalSelectCarrier } from './hooks/useModalSelectCarrier';
import { Modal, Paginate, TableResponsive } from "@/components";
import { useState, useEffect, useCallback } from 'react';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { Autocomplete } from '../autocomplete/Autocomplete';

interface Props {
    label?: string;
    error?: string;
    selectCarrier: (carrier: CarrierProps) => void;
}

export const SelectCarrier = ({ label, error, selectCarrier }: Props) => {

    const [displayValue, setDisplayValue] = useState(label ?? "");

    function handleSelect(carrier: CarrierProps) {
        setDisplayValue(`${carrier.atts.identication} - ${carrier.atts.name}`);
        selectCarrier(carrier);
    }

    const { isOpen, search, meta, links, suggestions, toggle, setSearch, fetchCarrier, handleSelectLocal: modalSelect } = useModalSelectCarrier(handleSelect);


    const axiosAuth = useAxiosAuth();


    const fetchSuggestions = useCallback(async (term: string) => {

        try {

            const res = await axiosAuth.get<GeneralPaginate<CarrierProps>>('carriers', { params: { search: term, page: 1, paginate: 8 } });

            return res.data.data;

        } catch {

            return [];

        }

    }, [axiosAuth]);


    const browse = (term: string) => {

        toggle();

        setSearch(term);

    };

    useEffect(() => {
        if (label) setDisplayValue(label);
    }, [label]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchCarrier(pageUrl);
    };

    return (
        <div className='flex flex-col w-full'>
            <Autocomplete<CarrierProps>
                value={displayValue}
                placeholder="Buscar transportista por identificación o nombre..."
                ariaLabel="Transportista"
                error={error}
                fetchItems={fetchSuggestions}
                getKey={(item) => String(item.id)}
                renderItem={(item) => (
                    <div className="flex items-baseline gap-2">
                        <span className="shrink-0 text-xs text-ink-3 tabular-nums">{item.atts.identication}</span>
                        <span className="flex-1 truncate">{item.atts.name}</span>
                    </div>
                )}
                onSelect={(item) => handleSelect(item)}
                onBrowse={browse}
            />

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Seleccionar transportista"
                modalSize="lg"
            >
                <input
                    type="search"
                    placeholder="Buscar por identificación o nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full mb-2 border rounded-lg px-3 py-2 text-sm bg-[var(--background)] border-[var(--border-strong)] focus:border-primary focus:outline-none dark:text-gray-300"
                />

                <div className="min-h-[260px] sm:min-h-[420px]">
                    <TableResponsive>
                        <thead>
                            <tr>
                                <th>Identificación</th>
                                <th className="text-left">Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map((carrier, indexItem) => (
                                <tr
                                    key={carrier.id}
                                    onClick={() => modalSelect(carrier)}
                                    className={`hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer transition-colors
                                    ${indexItem % 2 === 0 ? 'bg-[var(--background)]' : ''}`}
                                >
                                    <td>{carrier.atts.identication}</td>
                                    <td className="text-left">{carrier.atts.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </TableResponsive>
                </div>

                <div className="flex justify-center">
                    <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
                </div>
            </Modal>
        </div>
    );
};
