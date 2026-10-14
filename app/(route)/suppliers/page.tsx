"use client";

import { SupplierProvider, useSuppliers } from "./context/SupplierContext";
import { SupplierFilters, SupplierFormModal, SuppliersTable } from "./components";
import { Paginate, Title } from "@/components";

const SuppliersPagination = () => {
    const { meta, links, fetchSuppliers } = useSuppliers();
    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchSuppliers(pageUrl);
    };
    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
}

const SuppliersContent = () => {
    const { setSupplierFormId } = useSuppliers();

    return (
        <>
            <div className="dark:text-gray-300">
                <Title
                    title="Proveedores"
                    subTitle="Lista de todos los proveedores"
                    actions={[{ label: "Nuevo proveedor", type: "button", action: 'add', onClick: () => setSupplierFormId('new') }]}
                />
            </div>
            <div className="md:mx-8 py-4">
                <SupplierFilters />
                <SuppliersTable />
                <SuppliersPagination />
            </div>
            <SupplierFormModal />
        </>
    )
}

const SuppliersPage = () => {
    return (
        <SupplierProvider>
            <SuppliersContent />
        </SupplierProvider>
    )
}

export default SuppliersPage;

