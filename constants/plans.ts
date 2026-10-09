import { PlanCode, PlanErrorCode } from "@/types";

export const planOptions: { label: string; value: PlanCode; description: string }[] = [
    { label: 'Gratuito', value: 'GRATUITO', description: 'Prueba con acceso completo. Sin fecha dura 1 mes.' },
    { label: 'Facturador', value: 'FACTURADOR', description: 'Solo facturación, sin cartera.' },
    { label: 'Financiero', value: 'FINANCIERO', description: 'Facturación y cartera: crédito, anticipos, CxC, CxP y saldos iniciales.' },
];

export const planLabels: Record<PlanCode, string> = {
    GRATUITO: 'Gratuito',
    FACTURADOR: 'Facturador',
    FINANCIERO: 'Financiero',
};

// Días antes del vencimiento en que se muestra el aviso
export const PLAN_EXPIRY_WARNING_DAYS = 7;

// Evento global que dispara el interceptor de axiosAuth ante un 403 por plan
export const PLAN_ERROR_EVENT = 'facec:plan-error';

export interface PlanErrorDetail {
    code: PlanErrorCode;
    message: string;
}

// Destino del botón para conocer / contratar el plan Financiero
export const PLAN_FINANCIERO_URL = 'https://www.facec.ec';
