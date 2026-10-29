import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Movement } from "@/types";
import { AxiosInstance } from "axios";

// Comprobante de un pago con cuenta bancaria: se sube primero y el pago lleva su `receipt_id`.
// Si el pago no se guarda, el backend borra el comprobante sin vincular a las 24 h
export const uploadPaymentReceipt = async (
    axiosAuth: AxiosInstance,
    file: File,
): Promise<ApiResponse<{ id: number }>> => {
    const data = new FormData();
    data.append('receipt', file);
    return handleApiRequest<{ id: number }>(() => axiosAuth.post('payment-receipts', data, { headers: { 'Content-Type': 'multipart/form-data' } }));
};

// Archivo privado del comprobante (imagen, o PDF en movimientos manuales)
export const getMovementReceipt = async (
    axiosAuth: AxiosInstance,
    movementId: number,
): Promise<ApiResponse<Blob>> =>
    handleApiRequest<Blob>(() => axiosAuth.get(`movements/${movementId}/receipt`, { responseType: 'blob' }));

// Número y/o imagen del comprobante después de creado el movimiento (solo con cuenta bancaria).
// Clave ausente = sin cambio; null = se quita
export const updateMovementReceipt = async (
    axiosAuth: AxiosInstance,
    movementId: number,
    data: { receipt_number?: string | null; receipt_id?: number | null },
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.patch(`movements/${movementId}/receipt`, data));
