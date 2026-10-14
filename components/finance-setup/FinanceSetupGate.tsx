"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getCurrentSubscription } from "@/services/subscriptionServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { usePlan } from "@/lib/hooks/usePlan";

export const FINANCE_SETUP_PATH = '/finance-setup';

// Se consulta una vez por carga de la app; el asistente lo marca al guardar el efectivo
let setupDone: boolean | null = null;
const SETUP_DONE_EVENT = 'finance-setup-done';
export const markFinanceSetupDone = () => {
    setupDone = true;
    // El guardián ya montado tenía "falta" en su estado: se le avisa para que deje de redirigir
    window.dispatchEvent(new Event(SETUP_DONE_EVENT));
};

// Con cartera (plan Financiero) el efectivo inicial es obligatorio: sin caja general se envía al asistente
export const FinanceSetupGate = () => {

    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { status } = useSession();
    const { applies, canUseFinance } = usePlan();
    const [done, setDone] = useState<boolean | null>(setupDone);

    useEffect(() => {
        if (status !== 'authenticated' || !applies || !canUseFinance || setupDone !== null) return;
        // El backend sabe si la sucursal ya tiene caja GENERAL (los bancos no cuentan)
        getCurrentSubscription(axiosAuth).then(({ data }) => {
            // Sin respuesta no se bloquea; si el asistente ya guardó mientras tanto, gana el asistente
            if (!data || setupDone === true) return;
            setupDone = !data.needs_finance_setup;
            setDone(setupDone);
        });
    }, [axiosAuth, status, applies, canUseFinance]);

    useEffect(() => {
        const handleDone = () => setDone(true);
        window.addEventListener(SETUP_DONE_EVENT, handleDone);
        return () => window.removeEventListener(SETUP_DONE_EVENT, handleDone);
    }, []);

    useEffect(() => {
        if (done === false && setupDone !== true && !pathname.startsWith(FINANCE_SETUP_PATH)) {
            router.replace(FINANCE_SETUP_PATH);
        }
    }, [done, pathname, router]);

    return null;
};
