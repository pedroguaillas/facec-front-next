import { Warehouse } from "@/types";

interface Props {
    warehouses: Warehouse[];
    value: string;
    onChange: (value: string) => void;
}

export const WarehouseFilter = ({ warehouses, value, onChange }: Props) => {
    if (warehouses.length < 2) return null;

    return (
        <div className="flex flex-col gap-1.5 my-2">
            <label htmlFor="report-warehouse" className="text-sm font-medium">Bodega</label>
            <select
                id="report-warehouse"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-[var(--background)] border-[var(--border-strong)] dark:text-gray-300"
            >
                <option value="">Todas</option>
                {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
            </select>
        </div>
    );
};
