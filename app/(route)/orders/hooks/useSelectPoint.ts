import { useFormInvoice } from "../context/FormInvoiceContext";
import { useCallback, useEffect } from "react";

export const useSelectPoint = () => {

    const { invoice, points, selectPoint, setInvoice, setSelectPoint } = useFormInvoice();
    const { voucher_type } = invoice;

    // Se ejecuta en la primera petición de carga
    const handlePoints = useCallback(() => {
        if (points.length === 1) {
            setSelectPoint(points[0]);
        }
    }, [points, setSelectPoint]);

    useEffect(() => {
        // Se ejecuta solo al inicio cuando carga el formulario
        handlePoints();
    }, [points, handlePoints]);

    // Establece la serie en el invoice en dependecia del tipo de comprobante
    const handleSelectPoint = useCallback(() => {

        if (selectPoint && voucher_type) {

            const nextNumber = Number(voucher_type) === 1 ? selectPoint.invoice : selectPoint.creditnote;
            const serie = `${selectPoint.store}-${selectPoint.point}-${String(nextNumber).padStart(9, '0')}`;

            setInvoice((prev) => ({ ...prev, serie }));
        }
    }, [selectPoint, voucher_type, setInvoice]);

    useEffect(() => {
        // se ejecuta en las acciones de selectPoint
        handleSelectPoint();
    }, [selectPoint, handleSelectPoint]);

    useEffect(() => {
        // Se ejecuenta solo cuando cambia el tipo de comprobante
        handleSelectPoint();
    }, [voucher_type, handleSelectPoint]);

    return { handleSelectPoint, handlePoints };
};