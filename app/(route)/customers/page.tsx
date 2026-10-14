"use client";

import { Paginate, Title } from "@/components";
import { CustomersProvider, useCustomers } from "./context/CustomersContext";
import { CustomerFormModal, CustomersFilter, CustomersTable } from "./components";

const CustomersPagination = () => {
    const { meta, links, fetchCustomers } = useCustomers();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchCustomers(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const CustomersContent = () => {
    const { setCustomerFormId } = useCustomers();

    return (
        <div className="dark:text-gray-300">
            <Title
                title='Clientes'
                subTitle='Lista de todos los clientes'
                actions={[{ label: "Nuevo cliente", type: "button", action: "add", onClick: () => setCustomerFormId('new') }]}
            />
            <div className="md:mx-8 py-4">
                <CustomersFilter />
                <CustomersTable />
                <CustomersPagination />
            </div>
            <CustomerFormModal />
        </div>
    )
}

const PageCustomers = () => {
    return (
        <CustomersProvider>
            <CustomersContent />
        </CustomersProvider>
    )
}

export default PageCustomers;
