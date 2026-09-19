import { useFormInvoice } from "../context/FormInvoiceContext";
import { useCallback, useEffect } from "react";

export const useSelectPoint = () => {

    const { points, setSelectPoint } = useFormInvoice();

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

    return { handlePoints };
};