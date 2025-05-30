"use client";

import { ProductsProvider, useProducts } from './context/ProductContext';
import { ProductsFilter, ProductsTable } from './components';
import { Paginate, Title } from '@/components';

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
                    title='Productos o servicios'
                    subTitle='Lista de todos los productos o servicios'
                    actions={[{ label: "", type: "link", url: "products/create", action: "add" }]}
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