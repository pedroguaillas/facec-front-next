import { InventoryMovement, LaravelPaginator, Links, Meta } from "@/types";

type Decimal = number | string | null | undefined;

// Cantidades: hasta 6 decimales, sin ceros de relleno ("12.5", "-3")
export const formatQty = (value: Decimal) => {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? n.toLocaleString('es-EC', { maximumFractionDigits: 6 }) : '';
};

// Montos (costos, valores): 2 decimales; el costo unitario admite hasta 6
export const formatMoney = (value: Decimal, maxDecimals = 2) => {
    const n = Number(value ?? 0);
    return Number.isFinite(n)
        ? `$${n.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: maxDecimals })}`
        : '';
};

// Página pedida por <Paginate /> (manda la url completa del backend)
export const pageFromUrl = (url: string) => {
    try {
        return Number(new URL(url, 'http://local').searchParams.get('page')) || 1;
    } catch {
        return 1;
    }
};

// El paginador simple de Laravel trae meta/links en la raíz: se adapta al formato de <Paginate />
export const paginatorToMeta = <T,>(paginator: LaravelPaginator<T>): { meta: Meta; links: Links } => ({
    meta: {
        current_page: paginator.current_page,
        last_page: paginator.last_page,
        per_page: paginator.per_page,
        total: paginator.total,
        from: paginator.from,
        path: paginator.path,
    },
    links: {
        first: paginator.first_page_url,
        last: paginator.last_page_url,
        prev: paginator.prev_page_url,
        next: paginator.next_page_url,
    },
});

// Movimiento anulado o que anula a otro: se muestra atenuado en el kardex
export const isReversal = (movement: InventoryMovement) =>
    movement.type === 'Reversa' || movement.reverses_id !== null;

// Link al comprobante de origen del movimiento
export const documentUrl = (document: InventoryMovement['document']) =>
    !document ? null : document.type === 'order' ? `/orders/${document.id}` : `/shops/${document.id}`;
