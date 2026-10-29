"use client";

import { FaSearch } from "react-icons/fa";
import { useCompanies } from "../context/CompaniesContext"
import { CompanyActivityStatus } from "@/types";
import { activityLabels } from "./activity";

const activityFilters: { label: string; value: CompanyActivityStatus | '' }[] = [
    { label: 'Todas', value: '' },
    ...(Object.entries(activityLabels) as [CompanyActivityStatus, string][]).map(([value, label]) => ({ label, value })),
];

export const FilterCompanies = () => {
    
    const { search, setSearch, activity, setActivity } = useCompanies();

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div role="group" aria-label="Filtrar por uso de la cuenta" className="flex flex-wrap gap-1">
                {activityFilters.map(filter => (
                    <button
                        key={filter.value || 'all'}
                        type="button"
                        onClick={() => setActivity(filter.value)}
                        aria-pressed={activity === filter.value}
                        className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer ${activity === filter.value ? 'border-primary bg-primary/10 text-primary' : 'border-line text-ink-2 hover:border-line-strong'}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
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
