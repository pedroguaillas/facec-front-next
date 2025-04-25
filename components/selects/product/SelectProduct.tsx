"use client";

import ModalSelectProduct from './ModalSelectProduct';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import React, { useEffect, useState } from 'react';
import { GeneralPaginate } from '@/types';
import { FaSearch } from 'react-icons/fa';

interface Props {
    label?: string;
    error?: string;
    index: number;
    selectProduct: (index: number, product: ProductProps) => void;
}

export const SelectProduct = ({ label, error, index, selectProduct }: Props) => {

    const [search, setSearch] = useState(label ?? "");
    const [suggestions, setSuggestions] = useState<ProductProps[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [skipFetch, setSkipFetch] = useState(false); // 👈 Para evitar fetch al seleccionar
    const axiosAuth = useAxiosAuth();
    // Mostrar la modal
    const [showModal, setShowModal] = useState(false);

    const handleModal = () => {
        setShowModal(!showModal);
    }

    const handleSelectLocal = (product: ProductProps) => {
        handleSelect(product);
        setShowModal(false);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkipFetch(false); // 👈 habilita búsqueda
        setSearch(event.target.value);
    }

    const handleSelect = (product: ProductProps) => {
        setSearch(product.atts.name);
        setShowDropdown(false);
        setSkipFetch(true); // 👈 evita la búsqueda
        selectProduct(index, product);
    }

    const fetchProduct = async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<ProductProps>>(`productlist?page=${pageNumber}`, {
                search,
                paginate: 5,
            });
            const { data } = res.data;
            setSuggestions(data);
            setShowDropdown(true);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (search.length > 1 && !skipFetch) {
            fetchProduct();
        } else {
            setShowDropdown(false);
        }
    }, [search, skipFetch]);

    return (
        <>
            <div className='flex flex-col w-full'>
                <div className='flex w-full'>
                    <input
                        onChange={handleChange}
                        value={search}
                        className={`w-full border border-primary hover:border-primaryhover rounded-l px-2
                            ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-400 focus:ring-blue-500'}`}
                        type='text'
                    />
                    <span onClick={handleModal} className='rounded-r p-2 bg-primary text-white cursor-pointer'>
                        <FaSearch />
                    </span>
                    <ModalSelectProduct show={showModal} handleSelect={handleSelectLocal} onClose={handleModal} />
                </div>

                {showDropdown && suggestions.length > 0 && (
                    <div
                        className="border border-gray-300 shadow-md w-full rounded-b max-h-60 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {suggestions.map((product) => (
                            <div
                                key={product.id}
                                className="px-4 py-2 hover:bg-gray-100 hover:dark:bg-primary rounded cursor-pointer text-sm text-left"
                                onClick={() => handleSelect(product)}
                            >
                                {product.atts.code} - {product.atts.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </>
    );
};
