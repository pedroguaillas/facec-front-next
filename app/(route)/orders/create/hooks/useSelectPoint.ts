import { useCreateInvoice } from "../../context/InvoiceCreateContext";
import { useCallback, useEffect } from "react";

export const useSelectPoint = () => {

    const { invoice, points, selectPoint, setInvoice, setSelectPoint } = useCreateInvoice();
    const { voucher_type } = invoice;

    const handleSelectPointHook = useCallback(() => {

        if (selectPoint && invoice.voucher_type) {

            const nextNumber = Number(invoice.voucher_type) === 1 ? selectPoint.invoice : selectPoint.creditnote;
            const serie = `${selectPoint.store}-${selectPoint.point}-${String(nextNumber).padStart(9, '0')}`;

            setInvoice((prev) => ({ ...prev, serie }));
        }
    }, [selectPoint, voucher_type]);

    const handleChangePoints = useCallback(() => {
        if (points.length === 1) {
            setSelectPoint(points[0]);
        }
    }, [points]);

    useEffect(() => {
        handleSelectPointHook();
    }, [selectPoint, handleSelectPointHook]);

    useEffect(() => {
        handleSelectPointHook();
    }, [voucher_type]);

    useEffect(() => {
        handleChangePoints();
    }, [points]);

    return { handleSelectPointHook, handleChangePoints };
};