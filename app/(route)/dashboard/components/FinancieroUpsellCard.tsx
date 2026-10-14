"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaArrowRight, FaCheck, FaGift, FaSpinner } from "react-icons/fa6";
import { Modal } from "@/components";
import { GiftCelebration } from "@/components/gift-burst/GiftCelebration";
import { GiftRain } from "@/components/gift-burst/GiftRain";
import { PLAN_FINANCIERO_URL } from "@/constants/plans";
import { startFinancieroTrial } from "@/services/subscriptionServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useToast } from "@/context/ToastContext";

const TRIAL_DAYS = 30;

// Incentivo para animarse a probar
const PROMO = 'Si te animas a probarlo, participas por una suscripción gratuita.';

const benefits = [
    'Si te alcanza el dinero los próximos 30 días',
    'Quién te debe y desde cuándo',
    'Cuánto apartar para el SRI',
];

// Reemplaza a "Cartera vencida" en el plan Facturador: activa la prueba del plan Financiero en la misma app
export const FinancieroUpsellCard = () => {

    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, update } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    // Prueba activada: se muestra el regalo abriéndose antes de ir al asistente
    const [celebrating, setCelebrating] = useState(false);
    // Ya usó la prueba: queda el enlace para contratar
    const trialUsed = session?.user.permissions.financiero_trial_available === false;

    const activate = async () => {
        setIsActivating(true);
        const { data, error } = await startFinancieroTrial(axiosAuth);
        if (!data) {
            setIsActivating(false);
            toast(error ?? 'No se pudo activar la prueba', 'error');
            return;
        }
        setIsOpen(false);
        setCelebrating(true);
        // La sesión toma el plan nuevo del backend mientras se ve el regalo; luego, el asistente de efectivo
        await Promise.all([update({ refreshPlan: true }), new Promise(resolve => setTimeout(resolve, 3600))]);
        router.push('/finance-setup');
    };

    return (
        <>
        <section className="relative isolate overflow-hidden rounded-xl border border-brand-ink/20 bg-brand-soft p-5 lg:p-6 flex flex-col gap-3">
            {/* Mientras no la use: regalos cayendo para invitar a probar */}
            {!trialUsed && <GiftRain />}
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink">Plan Financiero</p>
            <h2 className="text-lg font-semibold tracking-tight leading-snug text-ink-1">
                Aprende a controlar el dinero de tu negocio
            </h2>
            <ul className="text-sm text-ink-2 space-y-1">
                {benefits.map(item => <li key={item}>{item}</li>)}
            </ul>
            {!trialUsed && (
                <p className="flex items-start gap-2 rounded-lg border border-brand-ink/20 bg-surface px-3 py-2 text-sm font-medium text-brand-ink">
                    <FaGift className="mt-0.5 shrink-0 animate-gift-wiggle origin-bottom" aria-hidden="true" />
                    {PROMO}
                </p>
            )}
            {trialUsed ? (
                <a
                    href={PLAN_FINANCIERO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryhover transition-colors"
                >
                    Contratar plan Financiero
                    <FaArrowRight className="text-xs" aria-hidden="true" />
                </a>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryhover transition-colors cursor-pointer"
                >
                    Probar {TRIAL_DAYS} días gratis
                    <FaArrowRight className="text-xs" aria-hidden="true" />
                </button>
            )}
        </section>

            {/* Fuera de la tarjeta: su "isolate" encerraría el z-index de estas capas fijas */}
            <Modal isOpen={isOpen} onClose={() => !isActivating && setIsOpen(false)} modalSize="sm" title="Probar el plan Financiero">
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-ink-2">
                        Se activa ahora por <strong className="text-ink-1">{TRIAL_DAYS} días gratis</strong>. Al terminar vuelves a tu plan actual sin perder nada.
                    </p>
                    <ul className="space-y-1.5 text-sm text-ink-2">
                        {[...benefits, 'Ventas y compras a crédito, anticipos y abonos'].map(item => (
                            <li key={item} className="flex gap-2">
                                <FaCheck className="mt-0.5 shrink-0 text-xs text-sri-ok" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="flex items-start gap-2 text-sm font-medium text-brand-ink">
                        <FaGift className="mt-0.5 shrink-0" aria-hidden="true" />
                        {PROMO}
                    </p>
                    <p className="rounded-lg bg-surface-sunken px-3 py-2 text-xs text-ink-3">
                        Para empezar te pediremos dos datos: cuánto efectivo tienes hoy y, si usas, el saldo de tus cuentas bancarias. Toma un minuto.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={isActivating}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-line-strong text-ink-2 hover:text-ink-1 cursor-pointer disabled:opacity-50"
                        >
                            Ahora no
                        </button>
                        <button
                            type="button"
                            onClick={activate}
                            disabled={isActivating}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primaryhover cursor-pointer disabled:opacity-60"
                        >
                            {isActivating && <FaSpinner className="animate-spin" aria-hidden="true" />}
                            {isActivating ? 'Activando…' : 'Activar prueba'}
                        </button>
                    </div>
                </div>
            </Modal>

            {celebrating && (
                <GiftCelebration title="¡Tu prueba está activa!">
                    <p>Ya participas por una suscripción gratuita.</p>
                    <p className="mt-3 inline-flex items-center gap-2 text-xs text-ink-3">
                        <FaSpinner className="animate-spin" aria-hidden="true" /> Preparando tu dinero…
                    </p>
                </GiftCelebration>
            )}
        </>
    );
};
