"use client";

import { SupplierProvider, useSuppliers } from "./context/SupplierContext";
import { SupplierFilters, SuppliersTable } from "./components";
import { Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";

const SuppliersPage = () => {

    const multipleActions: ActionsTitle[] = [
        { label: "", type: "link", url: 'suppliers/create', action: 'add' },
    ];
    const SuppliersPagination = () => {
        const { meta, links, fetchSuppliers } = useSuppliers();
        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchSuppliers(pageUrl);
        };
        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    }
    return (
        <SupplierProvider>
            <div className="dark:text-gray-300">
                <Title
                    title="Proveedores"
                    subTitle="Lista de todos los proveedores"
                    actions={multipleActions}
                />
            </div>
            <div className="md:mx-8 py-4">
                <SupplierFilters />
                <SuppliersTable />
                <SuppliersPagination />
            </div>
        </SupplierProvider>
    )
}

export default SuppliersPage;

