import { AxiosInstance } from "axios";
import { handleApiRequest } from "@/helpers/apiHandler";
import { PlanCode } from "@/types";

export interface PlanPermissions {
    plan: PlanCode | null;
    plan_ends_at: string | null;
    financiero: boolean;
    financiero_trial_available?: boolean;
    // Financiero sin caja GENERAL en la sucursal: falta el asistente de efectivo
    needs_finance_setup?: boolean;
}

// Prueba de 30 días del plan Financiero (una vez por empresa)
export const startFinancieroTrial = async (axiosAuth: AxiosInstance) =>
    handleApiRequest<{ succes: boolean; permissions: PlanPermissions; trial_ends_at: string; needs_finance_setup: boolean }>(
        () => axiosAuth.post('subscription/financiero-trial'),
    );

// Plan vigente y si falta configurar el efectivo inicial
export const getCurrentSubscription = async (axiosAuth: AxiosInstance) =>
    handleApiRequest<PlanPermissions>(() => axiosAuth.get('subscription/current'));
