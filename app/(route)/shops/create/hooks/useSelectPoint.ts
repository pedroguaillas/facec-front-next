import { useCallback, useEffect } from "react";
import { useCreateShop } from "../context/ShopCreateContext";

export const useSelectPoint = () => {
    const { shop, points, selectPoint, setShop, setSelectPoint } = useCreateShop();

    const handleSelectPoint = useCallback(() => {

        if (selectPoint && shop.voucher_type) {
            console.log('useCallback de selectPoint para las liquidaciones en compra')
            // if (Number(shop.voucher_type) === 3) {
            //     // TODO: Cambiar retention por liqidacion en compra al final
            //     const serie = `${selectPoint.store}-${selectPoint.point}-${String(selectPoint.retention).padStart(9, '0')}`;
            //     setShop((prev) => ({ ...prev, serie }));
            // }
            setShop((prevState) => ({
                ...prevState,
                serie_retencion: `${selectPoint.store}-${selectPoint.point}-${(selectPoint.retention + '').padStart(9, '0')}`
            }))
        }
    }, [selectPoint, shop.voucher_type, setShop]);

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
        // 2do en ejecutar
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

    // TODO: cuando se cambia a Liquidación en compra
    // useEffect(() => {
    //     // Se ejecuenta solo cuando cambia el tipo de comprobante
    //     handleSelectPoint();
    //     console.log('useEffect de: voucher_type')
    // }, [voucher_type]);

    return { handleSelectPoint, handlePoints };
}
