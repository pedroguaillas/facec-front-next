"use client";

import { useEffect, useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

export const useInvoices = (search: string, page: number) => {
  const axiosAuth = useAxiosAuth();
  const [invoices, setInvoices] = useState<OrderProps[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axiosAuth.post<OrderProps[]>(`orderlist?page=${page}`, { search });
        setInvoices(response.data);
      } catch (error) {
        console.error("Error al obtener facturas:", error);
      }
    };

    fetchInvoices();
  }, [axiosAuth]); // ⚠ Aquí agregamos axiosAuth como dependencia

  return { invoices };
};

export const useUploadInvoiceBatch = () => {
  const axiosAuth = useAxiosAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadInvoiceBatch = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("lot", file);
    formData.append("point_id", "1");

    try {
      await axiosAuth.post("orders/lot", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Error al subir el lote:", error);
      setError("Error al subir el lote.");
    } finally {
      setLoading(false);
    }
  };

  return { uploadInvoiceBatch, loading, error };
};
