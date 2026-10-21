import { InventoryShell } from "../components/InventoryShell";
import { InventoryOperationForm } from "../shared/InventoryOperationForm";

interface PageProps {
    searchParams: Promise<{ product_id?: string }>;
}

const PageInventoryAdjustments = async ({ searchParams }: PageProps) => {
    const { product_id } = await searchParams;

    return (
        <InventoryShell title="Ajustes de inventario" subTitle="Ingresos o salidas por rotura, conteo físico, muestras, etc.">
            <InventoryOperationForm mode="adjustment" initialProductId={product_id} />
        </InventoryShell>
    );
};

export default PageInventoryAdjustments;
