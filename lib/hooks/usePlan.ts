"use client";

import { useSession } from "next-auth/react";
import { getDate } from "@/helpers/dateHelper";
import { PlanCode } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

// Días desde hoy (zona Ecuador) hasta la fecha YYYY-MM-DD; negativo si ya pasó
const daysUntil = (date: string) => {
    const [ty, tm, td] = getDate().split('-').map(Number);
    const [y, m, d] = date.split('-').map(Number);
    return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / DAY_MS);
};

// Estado del plan de la empresa según los permisos del login.
// Los usuarios admin reciben `permissions: []`: para ellos no hay restricciones.
export const usePlan = () => {
    const { data: session } = useSession();
    const permissions = session?.user?.permissions;

    // Usuario cliente: permisos de empresa (objeto con `inventory`), traiga o no el plan
    const applies = !!permissions && !Array.isArray(permissions) && 'inventory' in permissions;
    // JWT emitido antes de las suscripciones: sin `plan` no se puede saber qué incluye (ver StaleSessionGuard)
    const isStale = applies && permissions.plan === undefined;
    const plan: PlanCode | null = permissions?.plan ?? null;
    const endsAt = permissions?.plan_ends_at ?? null;
    const daysLeft = endsAt ? daysUntil(endsAt) : null;

    // El permiso es una foto del login: si la fecha pasó durante la sesión también se considera vencido
    const isExpired = applies && (plan === null || (daysLeft !== null && daysLeft < 0));

    return {
        applies,
        plan,
        endsAt,
        daysLeft,
        isExpired,
        isStale,
        isTrial: plan === 'GRATUITO',
        // Puede crear / emitir comprobantes
        canEmit: !isExpired,
        // Puede usar cartera: crédito, anticipos, abonos y saldos iniciales
        canUseFinance: !applies || (!isStale && !!permissions?.financiero && !isExpired),
    };
};
