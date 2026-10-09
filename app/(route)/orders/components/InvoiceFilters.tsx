import { useInvoices } from "../context/InvoicesContext";
import { FaSearch, FaTimes } from "react-icons/fa";
import { sriFilterLabel } from "@/constants";

const InvoiceFilters = () => {
    
    const { search, setSearch, stateFilter, clearStateFilter } = useInvoices();
    const filterLabel = sriFilterLabel(stateFilter);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                {filterLabel && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface pl-3 pr-1 py-1 text-sm text-ink-2">
                        {filterLabel}
                        <button
                            type="button"
                            onClick={clearStateFilter}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-surface-hover text-ink-3 cursor-pointer"
                            aria-label="Quitar filtro"
                        >
                            <FaTimes className="text-xs" />
                        </button>
                    </span>
                )}
            </div>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <FaSearch />
                </span>
                <input
                    className="rounded pl-8 pr-2 py-1 bg-gray-50 dark:bg-gray-800 dark:focus:border-gray-500 dark:hover:border-gray-500"
                    type="search"
                    placeholder="Buscar ventas ..."
                    onChange={(e) => setSearch(e.target.value)} value={search}
                />
            </div>
        </div>
    );
};

export default InvoiceFilters;
