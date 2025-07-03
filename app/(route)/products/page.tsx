"use client";

import { ProductsProvider, useProducts } from './context/ProductContext';
import { ProductsFilter, ProductsTable } from './components';
import { Paginate, Title } from '@/components';
import { ActionsTitle } from '@/types';
import { useImportExcel } from './hooks/useImportExcel';

const ProductsPagination = () => {
    const { meta, links, fetchProducts } = useProducts();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchProducts(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const OrdersPage = () => {

    const importProducts = () => {
        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
    };

    const multipleActions: ActionsTitle[] = [
        { label: "Importar", type: "button", action: 'import', onClick: importProducts },
        { label: "", type: "link", url: "products/create", action: "add" },
    ];

    const { handleSelectFile } = useImportExcel();

    return (
        <ProductsProvider>
            <div className="dark:text-gray-300">

                <Title
                    title='Productos o servicios'
                    subTitle='Lista de todos los productos o servicios'
                    actions={multipleActions}
                />
                <div className="md:mx-8 py-4">
                    <ProductsFilter />
                    <ProductsTable />
                    <ProductsPagination />
                    <input type="file" onChange={handleSelectFile} className="hidden" accept=".csv" />
                </div>
            </div>
        </ProductsProvider>
    )
}

export default OrdersPage;