import { useCallback, useEffect } from "react";
import { useCreateShop } from "../context/ShopCreateContext";

export const useSelectPoint = () => {
    const { shop, points, selectPoint, setShop, setSelectPoint } = useCreateShop();
    // const { voucher_type } = shop;

    const handleSelectPointHook = useCallback(() => {

        if (selectPoint && shop.voucher_type) {
            console.log('useCallback de selectPoint')
            if (Number(shop.voucher_type) === 3) {
                const serie = `${selectPoint.store}-${selectPoint.point}-${String(selectPoint.retention).padStart(9, '0')}`;
                setShop((prev) => ({ ...prev, serie }));
            }
        }
    }, [selectPoint]);

    useEffect(() => {
        // 1ro en ejucutar
        // Se ejecuta inicio cuando llega los datos
        if (points.length > 0) {
            // console.log('useEffect de: points')
            handleChangePoints();
        }
    }, [points]);

    // Se ejecuta en la primera peteción de carga
    const handleChangePoints = useCallback(() => {
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
    }, [points]);

    useEffect(() => {
        // 3ro en ejecutar
        // se ejecuta en las acciones de selectPoint y handleSelectPointHook
        if (selectPoint !== null) {
            // console.log('useEffect de: selectPoint, handleSelectPointHook')
            handleSelectPointHook();
        }
    }, [selectPoint, handleSelectPointHook]);

    // TODO: cuando se cambia a Liquidación en compra
    // useEffect(() => {
    //     // Se ejecuenta solo cuando cambia el tipo de comprobante
    //     handleSelectPointHook();
    //     console.log('useEffect de: voucher_type')
    // }, [voucher_type]);

    return { handleSelectPointHook, handleChangePoints };
}
