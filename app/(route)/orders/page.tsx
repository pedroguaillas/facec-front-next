"use client";

import { InvoicesProvider, useInvoices } from "./context/InvoicesContext";
import InvoicesTable from "./components/InvoicesTable";
import InvoiceFilters from "./components/InvoiceFilters";
import { Alert, Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";
import { useImportExcel } from "./hooks/useImportExcel";
import { useSession } from "next-auth/react";
import Head from "next/head";

const InvoicesPage = () => {

    const { data: session } = useSession();
    // Define esta función antes de usarla
    const importOrders = () => {
        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
    };

    const multipleActions: ActionsTitle[] = [
        { label: "", type: "link", url: 'orders/create', action: 'add' },
    ];

    if (session?.user.permissions.import_in_invoices) {
        multipleActions.unshift({ label: "Importar", type: "button", action: 'import', onClick: importOrders });
    }

    const ProductsPagination = () => {
        const { meta, links, fetchInvoices, setPage } = useInvoices();

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchInvoices(pageUrl);
            setPage(parseInt(pageUrl?.match(/page=(\d+)/)?.[1] || '1'));
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    // Al terminar la carga del lote se refresca la tabla con fetchInvoices,
    // reemplazando el antiguo window.location.reload().
    const ImportLoteInput = () => {
        const { fetchInvoices } = useInvoices();
        const { handleLote, message } = useImportExcel({ onSuccess: () => fetchInvoices() });

        return (
            <>
                {message && <Alert message={message} />}
                <input type="file" onChange={handleLote} className="hidden" accept=".xlsx" />
            </>
        );
    };

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </Head>
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
                        <ImportLoteInput />
                    </div>
                </div>
            </InvoicesProvider>
        </>
    );
};

export default InvoicesPage;