import { InventoryShell } from "../components/InventoryShell";
import { InventoryOperationForm } from "../shared/InventoryOperationForm";

const PageInventoryTransfers = () => (
    <InventoryShell title="Transferencias" subTitle="Mover productos entre bodegas">
        <InventoryOperationForm mode="transfer" />
    </InventoryShell>
);

export default PageInventoryTransfers;
