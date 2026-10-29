"use client";

import { useCallback, useState } from "react";
import { AxiosInstance } from "axios";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { uploadPaymentReceipt } from "@/services/paymentReceiptServices";
import { receiptError } from "./PaymentReceiptInput";

// Imagen ya subida: si el pago falla y se reintenta, se reusa su id (aún sin vincular)
const uploaded = new WeakMap<File, number>();

// Sube el comprobante y devuelve el `receipt_id` que lleva el pago (nada si no hay imagen)
export const uploadReceiptFile = async (axiosAuth: AxiosInstance, file?: File | null): Promise<{ receipt_id?: number; error?: string }> => {
    if (!file) return {};
    const invalid = receiptError(file);
    if (invalid) return { error: invalid };
    const cached = uploaded.get(file);
    if (cached) return { receipt_id: cached };

    const { data, errors, error } = await uploadPaymentReceipt(axiosAuth, file);
    if (!data) return { error: errors?.receipt ?? error ?? 'No se pudo subir el comprobante' };
    uploaded.set(file, data.id);
    return { receipt_id: data.id };
};

export const usePaymentReceipt = () => {
    const axiosAuth = useAxiosAuth();
    const [receipt, setReceipt] = useState<File | null>(null);

    const uploadReceipt = useCallback(() => uploadReceiptFile(axiosAuth, receipt), [axiosAuth, receipt]);

    return { receipt, setReceipt, uploadReceipt };
};
