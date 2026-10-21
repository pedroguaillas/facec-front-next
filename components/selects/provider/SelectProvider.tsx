"use client";

import { SupplierProps, GeneralPaginate } from '@/types';
import { useModalSelectProvider } from './hooks/useModalSelectProvider';
import { Modal, TableResponsive, Paginate } from "@/components";
import { useState, useEffect, useCallback } from 'react';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { Autocomplete } from '../autocomplete/Autocomplete';

interface Props {
    label?: string;
    error?: string;
    selectProvider: (provider: SupplierProps) => void;
}

export const SelectProvider = ({ label, error, selectProvider }: Props) => {

    const [displayValue, setDisplayValue] = useState(label ?? "");

    function handleSelect(provider: SupplierProps) {
        setDisplayValue(`${provider.atts.identication} - ${provider.atts.name}`);
        selectProvider(provider);
    }

    const { isOpen, search, meta, links, suggestions, toggle, setSearch, fetchProvider, handleSelectLocal: modalSelect } = useModalSelectProvider(handleSelect);


    const axiosAuth = useAxiosAuth();


    const fetchSuggestions = useCallback(async (term: string) => {

        try {

            const res = await axiosAuth.get<GeneralPaginate<SupplierProps>>('providers', { params: { search: term, page: 1, paginate: 8 } });

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
        fetchProvider(pageUrl);
    };

    return (
        <div className='flex flex-col w-full'>
            <Autocomplete<SupplierProps>
                value={displayValue}
                placeholder="Buscar proveedor por identificación o nombre..."
                ariaLabel="Proveedor"
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
                title="Seleccionar proveedor"
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
                                <th className="hidden sm:block">#</th>
                                <th>Identificación</th>
                                <th className="text-left">Razón social</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map((provider, indexItem) => (
                                <tr
                                    key={provider.id}
                                    onClick={() => modalSelect(provider)}
                                    className={`hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer transition-colors
                                    ${indexItem % 2 === 0 ? 'bg-[var(--background)]' : ''}`}
                                >
                                    <td className="hidden sm:block">{indexItem + 1}</td>
                                    <td>{provider.atts.identication}</td>
                                    <td className="text-left">{provider.atts.name}</td>
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
