"use client";

import { Paginate, Title } from '@/components';
import { CarriersProvider, useCarriers } from './context/CarriersContext';
import { CarriersFilter, CarriersTable } from './components';

const CarriersPagination = () => {
    const { meta, links, fetchCarriers } = useCarriers();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchCarriers(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const OrdersPage = () => {
    return (
        <CarriersProvider>
            <div className="dark:text-gray-300">

                <Title
                    title='Transportistas'
                    subTitle='Lista de todos los transportistas'
                    actions={[{ label: "", type: "link", url: "carriers/create", action: "add" }]}
                />
                <div className="md:mx-8 py-4">
                    <CarriersFilter />
                    <CarriersTable />
                    <CarriersPagination />
                </div>
            </div>
        </CarriersProvider>
    )
}

export default OrdersPage;