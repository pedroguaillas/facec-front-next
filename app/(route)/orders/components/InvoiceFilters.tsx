import { useInvoices } from "../context/InvoicesContext";

const InvoiceFilters = () => {
    const { search, setSearch } = useInvoices();

    return (
        <div className="flex justify-end">
            <input
                className="rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 dark:focus:border-gray-500 dark:hover:border-gray-500"
                type="search"
                onChange={(e) => setSearch(e.target.value)} value={search}
            />
        </div>
    );
};

export default InvoiceFilters;
