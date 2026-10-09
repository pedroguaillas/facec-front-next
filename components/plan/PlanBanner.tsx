"use client";

import { useState } from "react";
import { FaExclamationTriangle, FaClock, FaTimes } from "react-icons/fa";
import { PLAN_EXPIRY_WARNING_DAYS, planLabels } from "@/constants/plans";
import { usePlan } from "@/lib/hooks/usePlan";

const formatDate = (date: string) => {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
};

// Aviso superior: plan vencido (fijo) o próximo a vencer (se puede cerrar)
export const PlanBanner = () => {
    const { applies, plan, endsAt, daysLeft, isExpired, isTrial } = usePlan();
    const [dismissed, setDismissed] = useState(false);

    if (!applies) return null;

    if (isExpired) {
        return (
            <div className="flex items-start gap-3 px-4 md:px-8 py-3 text-sm bg-sri-fail-soft text-ink-1 border-b border-line" role="alert">
                <FaExclamationTriangle className="shrink-0 mt-0.5 text-sri-fail" />
                <p>
                    <strong className="font-semibold">Tu plan está vencido.</strong>{' '}
                    Puedes consultar, descargar, editar y anular comprobantes, pero no emitir nuevos. Renueva tu suscripción para seguir facturando.
                </p>
            </div>
        );
    }

    if (dismissed || daysLeft === null || !endsAt || daysLeft > PLAN_EXPIRY_WARNING_DAYS) return null;

    const when = daysLeft === 0 ? 'hoy' : daysLeft === 1 ? 'mañana' : `en ${daysLeft} días`;
    const text = isTrial
        ? `Tu prueba gratuita termina ${when} (${formatDate(endsAt)}).`
        : `Tu plan ${plan ? planLabels[plan] : ''} vence ${when} (${formatDate(endsAt)}).`;

    return (
        <div className="flex items-center gap-3 px-4 md:px-8 py-2.5 text-sm bg-sri-wait-soft text-ink-1 border-b border-line" role="status">
            <FaClock className="shrink-0 text-sri-wait" />
            <p className="flex-1">
                <strong className="font-semibold">{text}</strong>{' '}
                {isTrial ? 'Elige un plan para seguir usando el sistema.' : 'Renueva para no interrumpir la emisión de comprobantes.'}
            </p>
            <button
                type="button"
                onClick={() => setDismissed(true)}
                className="shrink-0 inline-flex items-center justify-center min-w-9 min-h-9 rounded-full hover:bg-sri-wait-soft text-ink-2 cursor-pointer"
                aria-label="Ocultar aviso"
            >
                <FaTimes />
            </button>
        </div>
    );
};
