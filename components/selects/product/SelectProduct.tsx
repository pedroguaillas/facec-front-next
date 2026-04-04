"use client";

import { ProductProps } from '@/types';
import { useModalSelectProduct } from './hooks/useModalSelectProduct';
import { Modal, TableResponsive, Paginate } from "@/components";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from 'react';

interface Props {
    label?: string;
    error?: string;
    index: number;
    selectProduct: (index: number, product: ProductProps) => void;
}

export const SelectProduct = ({ label, error, index, selectProduct }: Props) => {

    const [displayValue, setDisplayValue] = useState(label ?? "");

    function handleSelect(product: ProductProps) {
        setDisplayValue(`${product.atts.code} - ${product.atts.name}`);
        selectProduct(index, product);
    }

    const { isOpen, search, meta, links, suggestions, setSearch, toggle, fetchProduct, handleSelectLocal: modalSelect } = useModalSelectProduct(handleSelect);

    useEffect(() => {
        if (label) setDisplayValue(label);
    }, [label]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchProduct(pageUrl);
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
                    {displayValue || 'Seleccionar producto...'}
                </span>
                <FaSearch className="text-xs opacity-40 shrink-0 ml-2" />
            </button>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Seleccionar producto"
                modalSize="lg"
            >
                <input
                    type="search"
                    placeholder="Buscar por código o nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full mb-2 border rounded-lg px-3 py-2 text-sm bg-[var(--background)] border-[var(--border-strong)] focus:border-primary focus:outline-none dark:text-gray-300"
                />

                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="hidden sm:block">#</th>
                            <th>Código</th>
                            <th className="text-left">Producto/Servicio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suggestions.map((product, indexItem) => (
                            <tr
                                key={product.id}
                                onClick={() => modalSelect(product)}
                                className={`hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer transition-colors
                                ${indexItem % 2 === 0 ? 'bg-[var(--background)]' : ''}`}
                            >
                                <td className="hidden sm:block">{indexItem + 1}</td>
                                <td>{product.atts.code}</td>
                                <td className="text-left">{product.atts.name}</td>
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
