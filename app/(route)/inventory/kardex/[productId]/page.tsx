import { KardexView } from "../../components/KardexView";

interface PageProps {
    params: Promise<{ productId: string }>;
    searchParams: Promise<{ warehouse_id?: string }>;
}

const PageKardex = async ({ params, searchParams }: PageProps) => {
    const { productId } = await params;
    const { warehouse_id } = await searchParams;

    return <KardexView productId={productId} initialWarehouseId={warehouse_id ?? ''} />;
};

export default PageKardex;
