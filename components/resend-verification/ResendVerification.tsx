"use client";

import { useEffect, useState } from "react";
import { resendVerificationEmail } from "@/services/registerServices";

// Espera entre reenvíos (el backend admite 6 por minuto)
const COOLDOWN_SECONDS = 30;

interface Props {
    user: string;
}

// Botón "Reenviar correo" de confirmación, con espera para no saturar
export const ResendVerification = ({ user }: Props) => {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<string>();
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const resend = async () => {
        if (!user || isPending || cooldown > 0) return;
        setIsPending(true);
        const { data, error } = await resendVerificationEmail(user);
        setIsPending(false);
        setMessage(data?.message ?? error ?? 'No se pudo reenviar el correo');
        if (data) setCooldown(COOLDOWN_SECONDS);
    };

    return (
        <div className="text-center">
            <button
                type="button"
                onClick={resend}
                disabled={isPending || cooldown > 0 || !user}
                className="inline-flex items-center justify-center rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition-colors cursor-pointer hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Enviando…' : cooldown > 0 ? `Reenviar correo (${cooldown}s)` : 'Reenviar correo'}
            </button>
            {message && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400" role="status">{message}</p>}
        </div>
    );
};
