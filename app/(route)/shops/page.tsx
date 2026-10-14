"use client";

import { ShopsProvider, useShops } from "./context/ShopsContext";
import { ShopsTable } from "./components/ShopsTable";
import ShopFilters from "./components/ShopFilters";
import { Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";
import { usePlan } from "@/lib/hooks/usePlan";

const ShopsPagination = () => {
    const { meta, links, fetchShops, setPage } = useShops();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchShops(pageUrl);
        setPage(parseInt(pageUrl?.match(/page=(\d+)/)?.[1] || '1'));
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const PageShops = () => {

    const { canEmit } = usePlan();
    const multipleActions: ActionsTitle[] = [
        { label: "Nueva compra", type: "link", url: 'shops/create', action: 'add', disabled: !canEmit, title: canEmit ? 'Nueva compra' : 'Tu plan está vencido' },
    ];

    return (
        <ShopsProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Compras"
                    subTitle="Lista de todas las compras"
                    actions={multipleActions}
                />
                <div className="md:mx-8 py-4">
                    <ShopFilters />
                    <ShopsTable />
                    <ShopsPagination />
                </div>
            </div>
        </ShopsProvider>
    )
}

export default PageShops;
