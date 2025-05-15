"use client";

import { InvoicesProvider, useInvoices } from "./context/InvoicesContext";
import InvoicesTable from "./components/InvoicesTable";
import InvoiceFilters from "./components/InvoiceFilters";
import { Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";
import { useImportExcel } from "./hooks/useImportExcel";

const InvoicesPage = () => {

    const { handleLote } = useImportExcel();
    // Define esta función antes de usarla
    const importOrders = () => {
        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
    };

    const multipleActions: ActionsTitle[] = [
        { label: "Importar", type: "button", action: 'import', onClick: importOrders },
        { label: "", type: "link", url: 'orders/create', action: 'add' },
    ];

    const ProductsPagination = () => {
        const { meta, links, fetchInvoices, setPage } = useInvoices();

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchInvoices(pageUrl);
            setPage(parseInt(pageUrl?.match(/page=(\d+)/)?.[1] || '1'));
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    return (
        <InvoicesProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Ventas"
                    subTitle="Lista de todas las ventas"
                    actions={multipleActions}
                />
                <div className="md:mx-8 py-4">
                    <InvoiceFilters />
                    <InvoicesTable />
                    <ProductsPagination />
                    <input type="file" onChange={handleLote} className="hidden" accept=".xlsx" />
                </div>
            </div>
        </InvoicesProvider>
    );
};

export default InvoicesPage;