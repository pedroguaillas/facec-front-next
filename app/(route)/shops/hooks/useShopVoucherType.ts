import { useFormShop } from "../context/FormShopContext";
import { SHOP_VOUCHER_TYPE_SLUG } from "@/constants";
import { useInventory } from "@/lib/hooks/useInventory";

export const useShopVoucherType = () => {
    const { shop, voucherTypes } = useFormShop();
    const { enabled: inventory } = useInventory();
    const slug = voucherTypes.find((vt) => vt.id === Number(shop.voucher_type_id))?.slug;
    const isFactura = slug === SHOP_VOUCHER_TYPE_SLUG.FACTURA;
    const isNotaVenta = slug === SHOP_VOUCHER_TYPE_SLUG.NOTA_VENTA;
    const isLiquidacion = slug === SHOP_VOUCHER_TYPE_SLUG.LIQUIDACION_COMPRA;

    return {
        isFactura,
        isNotaVenta,
        isLiquidacion,
        isNotaDebito: slug === SHOP_VOUCHER_TYPE_SLUG.NOTA_DEBITO,
        // Con inventario, factura y nota de venta detallan productos solo para ingresarlos al kardex:
        // las bases se copian del comprobante y las líneas no las recalculan (eso es solo de la liquidación)
        isInventoryEntry: inventory && (isFactura || isNotaVenta),
        withProducts: isLiquidacion || (inventory && (isFactura || isNotaVenta)),
    };
};
