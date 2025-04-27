"use client";

import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import React, { useEffect, useState } from 'react';
import { GeneralPaginate } from '@/types';
import { FaSearch } from 'react-icons/fa';
import ModalSelectProvider from './ModalSelectProvider';

interface Props {
    label?: string;
    error?: string;
    selectProvider: (provider: SupplierProps) => void;
}

export const SelectProvider = ({ label, error, selectProvider }: Props) => {

    const [search, setSearch] = useState(label ?? "");
    const [suggestions, setSuggestions] = useState<SupplierProps[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [skipFetch, setSkipFetch] = useState(false); // 👈 Para evitar fetch al seleccionar
    const axiosAuth = useAxiosAuth();
    // Mostrar la modal
    const [showModal, setShowModal] = useState(false);

    const handleModal = () => {
        setShowModal(!showModal);
    }

    const handleSelectLocal = (provider: SupplierProps) => {
        handleSelect(provider);
        setShowModal(false);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkipFetch(false); // 👈 habilita búsqueda
        setSearch(event.target.value);
    }

    const handleSelect = (provider: SupplierProps) => {
        setSearch(provider.atts.name);
        setShowDropdown(false);
        setSkipFetch(true); // 👈 evita la búsqueda
        selectProvider(provider);
    }

    const fetchProvider = async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<SupplierProps>>(`providerlist?page=${pageNumber}`, {
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
            fetchProvider();
        } else {
            setShowDropdown(false);
        }
    }, [search, skipFetch]);

    return (
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
                <ModalSelectProvider show={showModal} handleSelect={handleSelectLocal} onClose={handleModal} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {showDropdown && suggestions.length > 0 && (
                <div
                    className="border border-gray-300 shadow-md w-full rounded-b max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {suggestions.map((customer) => (
                        <div
                            key={customer.id}
                            className="px-4 py-2 hover:bg-gray-100 hover:dark:bg-primary rounded cursor-pointer text-sm text-left"
                            onClick={() => handleSelect(customer)}
                        >
                            {customer.atts.identication} - {customer.atts.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
