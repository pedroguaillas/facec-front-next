import { useFormShop } from "../context/FormShopContext";
import { SHOP_VOUCHER_TYPE_SLUG } from "@/constants";

export const useShopVoucherType = () => {
    const { shop, voucherTypes } = useFormShop();
    const slug = voucherTypes.find((vt) => vt.id === Number(shop.voucher_type_id))?.slug;

    return {
        isFactura: slug === SHOP_VOUCHER_TYPE_SLUG.FACTURA,
        isNotaVenta: slug === SHOP_VOUCHER_TYPE_SLUG.NOTA_VENTA,
        isLiquidacion: slug === SHOP_VOUCHER_TYPE_SLUG.LIQUIDACION_COMPRA,
        isNotaDebito: slug === SHOP_VOUCHER_TYPE_SLUG.NOTA_DEBITO,
    };
};
