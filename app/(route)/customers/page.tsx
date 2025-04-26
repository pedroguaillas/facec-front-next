"use client";

import { Paginate, Title } from "@/components";
import { CustomersProvider, useCustomers } from "./context/CustomersContext";
import { CustomersTable } from "./components/CustomersTable";
import { CustomersFilter } from "./components/CustomersFilter";

const CustomersPagination = () => {
    const { meta, links, fetchCustomers } = useCustomers();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchCustomers(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const PageCustomers = () => {
    return (
        <CustomersProvider>
            <div className="dark:text-gray-300">
                <Title
                    title='Clientes'
                    subTitle='Lista de todos los clientes'
                    actions={[{ label: "+", type: "link", url: "customers/create", action: "create" }]}
                />
                <div className="md:mx-8 py-4">
                    <CustomersFilter />
                    <CustomersTable />
                    <CustomersPagination />
                </div>

            </div>
        </CustomersProvider>
    )
}

export default PageCustomers;
