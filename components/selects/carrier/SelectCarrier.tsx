"use client";

import { CarrierProps } from '@/types';
import { useModalSelectCarrier } from './hooks/useModalSelectCarrier';
import { Modal, Paginate, TableResponsive } from "@/components";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from 'react';

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

    useEffect(() => {
        if (label) setDisplayValue(label);
    }, [label]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchCarrier(pageUrl);
    };

    return (
        <div className='flex flex-col w-full'>
            <button
                type="button"
                onClick={toggle}
                className={`
                    w-full flex items-center justify-between
                    border rounded-lg px-3 py-2 text-sm text-left
                    transition-colors duration-150 cursor-pointer
                    bg-[var(--background)]
                    ${error ? 'border-red-400' : 'border-[var(--border-strong)] hover:border-primary'}
                    dark:text-gray-300
                `}
            >
                <span className={displayValue ? 'text-[var(--foreground)]' : 'opacity-40'}>
                    {displayValue || 'Seleccionar transportista...'}
                </span>
                <FaSearch className="text-xs opacity-40 shrink-0 ml-2" />
            </button>

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

                <div className="flex justify-center">
                    <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
                </div>
            </Modal>
        </div>
    );
};
