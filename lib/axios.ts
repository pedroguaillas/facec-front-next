import axios from "axios";
import { PLAN_ERROR_EVENT } from "@/constants/plans";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
});

export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
});

// 403 por plan: se avisa globalmente (no es logout). El componente PlanErrorNotice
// escucha este evento y muestra el aviso de renovar / actualizar plan.
const PLAN_ERROR_CODES = ['subscription_expired', 'plan_required'];

axiosAuth.interceptors.response.use(
    (response) => response,
    (error) => {
        const data = error.response?.data;
        if (typeof window !== 'undefined' && error.response?.status === 403 && PLAN_ERROR_CODES.includes(data?.error)) {
            window.dispatchEvent(new CustomEvent(PLAN_ERROR_EVENT, {
                detail: { code: data.error, message: data.message },
            }));
        }
        return Promise.reject(error);
    },
);
