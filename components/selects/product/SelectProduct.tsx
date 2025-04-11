"use client";

import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { GeneralPaginate, Links } from '@/types';
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface Props {
    label: string;
}

export const SelectProduct = ({ label }: Props) => {

    const [search, setSearch] = useState(label);
    const [suggestions, setSuggestions] = useState<ProductPaginate[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [meta, setMeta] = useState<Meta>({});
    const [links, setLinks] = useState<Links>({});
    const axiosAuth = useAxiosAuth();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        fetchProduct()
    }

    const fetchProduct = async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<ProductPaginate>>(`productlist?page=${pageNumber}`, {
                search,
                paginate: 10,
            });
            const { data, links, meta } = res.data;
            setSuggestions(data);
            setLinks(links);
            setMeta(meta);
            setShowDropdown(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelect = (product) => {

    }

    return (
        <div className='flex flex-col w-full'>

            <div className='flex w-full'>

                {/* Input search by suggestions */}
                <input onChange={handleChange} value={search} className='w-full border border-primary rounded-l px-2' type='text' />

                <span className='rounded-r p-2 bg-primary'>
                    <FaSearch />
                </span>
            </div>

            {/* 🔽 Dropdown de sugerencias */}
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
    )
}
