// Inventario (kardex + bodegas + costo promedio). Solo con permissions.inventory.
// Los decimales llegan como string desde Laravel (cast decimal): convertir con Number().
type Decimal = number | string;

export interface Warehouse {
    id: number;
    branch_id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export type InventoryDirection = 'in' | 'out';

export type InventoryMovementType =
    | 'Venta'
    | 'Devolución en venta'
    | 'Compra'
    | 'Inventario inicial'
    | 'Ajuste ingreso'
    | 'Ajuste salida'
    | 'Transferencia ingreso'
    | 'Transferencia salida'
    | 'Reversa';

// Fila del kardex
export interface InventoryMovement {
    id: number;
    date: string;
    product_id: number;
    warehouse_id: number;
    warehouse?: string;
    type: InventoryMovementType;
    direction: InventoryDirection;
    quantity: Decimal;
    price: Decimal | null;
    unit_cost: Decimal | null;
    previous_balance: Decimal;
    new_balance: Decimal;
    average_cost: Decimal;
    balance_value: Decimal;
    reverses_id: number | null;
    document_uuid: string | null;
    document: { type: 'order' | 'shop'; id: number; serie?: string | null } | null;
    note: string | null;
    user?: string | null;
}

export interface InventoryStockWarehouse {
    warehouse_id: number;
    name: string;
    stock: Decimal;
    average_cost: Decimal;
    value: Decimal;
}

export interface InventoryStockItem {
    id: number;
    code: string;
    name: string;
    min_stock: Decimal | null;
    stock: Decimal;
    below_min: boolean;
    average_cost: Decimal;
    value: Decimal;
    warehouses: InventoryStockWarehouse[];
}

// Paginador simple de Laravel (sin Resource): las claves de meta vienen en la raíz
export interface LaravelPaginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export interface InventoryItemForm {
    id: string;
    product_id: number;
    name?: string;
    stock?: Decimal | null;
    quantity: string;
    unit_cost: string;
}

export interface InventoryOperationResponse {
    succes: boolean;
    message: string;
    document_uuid: string;
    movements: InventoryMovement[];
}

export interface InventoryValuation {
    date: string;
    total_value: Decimal;
    items: { product_id: number; code: string; name: string; quantity: Decimal; average_cost: Decimal; value: Decimal }[];
}

export interface InventoryCostOfSales {
    from: string;
    to: string;
    totals: { cost: Decimal; revenue: Decimal; gross_profit: Decimal };
    items: { product_id: number; code: string; name: string; quantity: Decimal; cost: Decimal; revenue: Decimal; gross_profit: Decimal }[];
}
