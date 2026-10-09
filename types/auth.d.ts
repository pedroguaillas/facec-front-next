import { PlanCode } from "./subscription";

export type AuthUser = {
  expires_in: number;
  token: string;
  token_type: string;
  // permisos
  permissions: {
    inventory: boolean;
    decimal: number;
    printf: boolean;
    guia_in_invoice: boolean;
    import_in_invoice: boolean;
    import_in_invoices: boolean;
    // Plan de suscripción (solo usuarios cliente; los admin no lo traen).
    // Es una foto al momento del login: no se refresca hasta volver a iniciar sesión.
    plan?: PlanCode | null; // null = vencido / sin plan
    plan_ends_at?: string | null; // YYYY-MM-DD
    financiero?: boolean; // true si el plan incluye cartera (GRATUITO o FINANCIERO)
  };
  // usuario
  user: {
    id: number;
    user: string;
    email: string;
    avatar: null;
    user_type_id: number;
  };
}