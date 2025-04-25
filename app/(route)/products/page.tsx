"use client";

import { ProductsProvider, useProducts } from './context/ProductContext';
import { ProductsTable } from './components/ProductsTable';
import { Paginate, Title } from '@/components';
import { ProductsFilter } from './components/ProductsFilter';

const ProductsPagination = () => {
    const { meta, links, fetchProducts } = useProducts();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchProducts(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const OrdersPage = () => {
    return (
        <ProductsProvider>
            <div className="dark:text-gray-300">

                <Title
                    title='Productos'
                    subTitle='Lista de todos los productos'
                    actions={[{ label: "+", type: "link", url: "products/create", action: "create" }]}
                />
                <div className="md:mx-8 py-4">
                    <ProductsFilter />
                    <ProductsTable />
                    <ProductsPagination />
                </div>
            </div>
        </ProductsProvider>
    )
}

export default OrdersPage;