"use client";

import { InvoicesProvider, useInvoices } from "./context/InvoicesContext";
import InvoicesTable from "./components/InvoicesTable";
import InvoiceFilters from "./components/InvoiceFilters";
import { Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";

const InvoicesPage = () => {

    const multipleActions: ActionsTitle[] = [
        { label: "Importar", type: "button", action: 'import', onClick: () => importOrders() },
        { label: "+", type: "link", url: 'orders/create', action: 'create' },
    ];

    const importOrders = () => {

    }

    const ProductsPagination = () => {
        const { meta, links, fetchInvoices } = useInvoices();

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchInvoices(pageUrl);
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
                </div>
            </div>
        </InvoicesProvider>
    );
};

export default InvoicesPage;