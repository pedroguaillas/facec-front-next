"use client";

import { Paginate, Title } from '@/components';
import { CarriersProvider, useCarriers } from './context/CarriersContext';
import { CarrierFormModal, CarriersFilter, CarriersTable } from './components';

const CarriersPagination = () => {
    const { meta, links, fetchCarriers, setPage } = useCarriers();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        setPage(parseInt(pageUrl?.match(/page=(\d+)/)?.[1] || '1'));
        fetchCarriers(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const CarriersContent = () => {
    const { setCarrierFormId } = useCarriers();

    return (
        <div className="dark:text-gray-300">

            <Title
                title='Transportistas'
                subTitle='Lista de todos los transportistas'
                actions={[{ label: "Nuevo transportista", type: "button", action: "add", onClick: () => setCarrierFormId('new') }]}
            />
            <div className="md:mx-8 py-4">
                <CarriersFilter />
                <CarriersTable />
                <CarriersPagination />
            </div>
            <CarrierFormModal />
        </div>
    )
}

const CarriersPage = () => {
    return (
        <CarriersProvider>
            <CarriersContent />
        </CarriersProvider>
    )
}

export default CarriersPage;