"use client";

import { ProductsProvider, useProducts } from './context/ProductContext';
import { ProductsFilter, ProductsTable } from './components';
import { Notice, Paginate, Title } from '@/components';
import { ActionsTitle } from '@/types';
import { useImportExcel } from './hooks/useImportExcel';
import { exportProducts } from './services/productServices';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';

const ProductsPagination = () => {
    const { meta, links, fetchProducts } = useProducts();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchProducts(pageUrl);
    };

    return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

// Al terminar la importación se refresca la tabla con fetchProducts,
// reemplazando el antiguo window.location.reload().
const ImportProductsInput = () => {
    const { fetchProducts } = useProducts();
    const { handleSelectFile, isPending, result } = useImportExcel({ onSuccess: () => fetchProducts() });

    return (
        <>
            {isPending && <Notice tone="info" title="Importando productos..." />}
            {result && <Notice tone={result.tone} title={result.text} />}
            <input type="file" onChange={handleSelectFile} className="hidden" accept=".csv" />
        </>
    );
};

const OrdersPage = () => {
    const axiosAuth = useAxiosAuth();

    const importProducts = () => {
        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
    };

    const handleExportProducts = () => {
        exportProducts(axiosAuth);
    };

    const multipleActions: ActionsTitle[] = [
        { label: "Importar", type: "button", action: 'import', onClick: importProducts },
        { label: "Exportar", type: "button", action: 'export', onClick: handleExportProducts },
        { label: "Nuevo producto", type: "link", url: "products/create", action: "add" },
    ];

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
                    <ImportProductsInput />
                </div>
            </div>
        </ProductsProvider>
    )
}

export default OrdersPage;