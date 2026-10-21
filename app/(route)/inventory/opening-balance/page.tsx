import { InventoryShell } from "../components/InventoryShell";
import { InventoryOperationForm } from "../shared/InventoryOperationForm";

const PageInventoryOpeningBalance = () => (
    <InventoryShell title="Inventario inicial" subTitle="Stock inicial con su costo">
        <InventoryOperationForm mode="opening" />
    </InventoryShell>
);

export default PageInventoryOpeningBalance;
