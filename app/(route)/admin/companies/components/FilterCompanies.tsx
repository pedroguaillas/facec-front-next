"use client";

import { FaSearch } from "react-icons/fa";
import { useCompanies } from "../context/CompaniesContext"

export const FilterCompanies = () => {
    
    const { search, setSearch } = useCompanies();

    return (
        <div className="flex justify-end">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <FaSearch />
                </span>
                <input
                    className="rounded pl-8 pr-2 py-1 bg-gray-50 dark:bg-gray-800 dark:focus:border-gray-500 dark:hover:border-gray-500"
                    type="search"
                    placeholder="Buscar compañias ..."
                    onChange={(e) => setSearch(e.target.value)} value={search}
                />
            </div>
        </div>
    )
}
