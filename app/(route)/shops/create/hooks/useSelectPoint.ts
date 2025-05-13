import { useCallback, useEffect } from "react";
import { useCreateShop } from "../context/ShopCreateContext";
import { VoucherType } from "@/constants";

export const useSelectPoint = () => {
    const { shop, points, applieWithholding, selectPoint, setShop, setSelectPoint, setProductOutputs } = useCreateShop();

    // 4to Selección manual del Punto del Emisión
    const handleSelectPoint = useCallback(() => {
        if (!selectPoint || !shop.voucher_type) return;

        const baseSerie = `${selectPoint.store}-${selectPoint.point}-`;

        const updates: Partial<typeof shop> = {};

        if (Number(shop.voucher_type) === VoucherType.LIQUIDATION) {
            updates.serie = `${baseSerie}${String(selectPoint.settlementonpurchase).padStart(9, '0')}`;
        } else {
            setProductOutputs([])
        }

        if (applieWithholding) {
            updates.serie_retencion = `${baseSerie}${String(selectPoint.retention).padStart(9, '0')}`;
        }

        setShop((prev) => ({ ...prev, ...updates }));
    }, [selectPoint, shop.voucher_type, setShop, applieWithholding, setProductOutputs]);

    useEffect(() => {
        // 3ro en ejecutar
        // se ejecuta en las acciones de selectPoint y handleSelectPoint
        // if (selectPoint !== null) {
        // console.log('useEffect de: selectPoint, handleSelectPoint')
        handleSelectPoint();
        // }
    }, [selectPoint, handleSelectPoint]);

    // Se ejecuta en la primera petición de carga
    const handlePoints = useCallback(() => {
        // 2do en ejecutar solo cuando hay un solo punto de emisión
        if (points.length === 1) {
            // console.log('useCallback de: points')
            const selectedPoint = points[0];
            setSelectPoint(selectedPoint);
            setShop((prevState) => ({
                ...prevState,
                serie_retencion: `${selectedPoint.store}-${selectedPoint.point}-${(selectedPoint.retention + '').padStart(9, '0')}`
            }))
        }
    }, [points, setSelectPoint, setShop]);

    useEffect(() => {
        // 1ro en ejucutar
        // Se ejecuta inicio cuando llega los datos
        if (points.length > 0) {
            // console.log('useEffect de: points')
            handlePoints();
        }
    }, [points, handlePoints]);

    return { handleSelectPoint, handlePoints };
}
