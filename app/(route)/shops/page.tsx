"use client";

import { ShopsProvider, useShops } from "./context/ShopsContext";
import { ShopsTable } from "./components/ShopsTable";
import ShopFilters from "./components/ShopFilters";
import { Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";

const ShopsPagination = () => {
    const { meta, links, fetchShops } = useShops();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchShops(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const PageShops = () => {

    const multipleActions: ActionsTitle[] = [
        { label: "+", type: "link", url: 'shops/create', action: 'create' },
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
