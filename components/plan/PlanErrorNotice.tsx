"use client";

import { useEffect, useState } from "react";
import { FaLock, FaRedo } from "react-icons/fa";
import { Modal } from "../modal/Modal";
import { PLAN_ERROR_EVENT, PlanErrorDetail } from "@/constants/plans";

const titles: Record<PlanErrorDetail['code'], string> = {
    subscription_expired: 'Tu plan está vencido',
    plan_required: 'Función del plan Financiero',
};

// Escucha los 403 por plan (ver interceptor en lib/axios.ts) y muestra el aviso
export const PlanErrorNotice = () => {
    const [notice, setNotice] = useState<PlanErrorDetail | null>(null);

    useEffect(() => {
        const handle = (e: Event) => setNotice((e as CustomEvent<PlanErrorDetail>).detail);
        window.addEventListener(PLAN_ERROR_EVENT, handle);
        return () => window.removeEventListener(PLAN_ERROR_EVENT, handle);
    }, []);

    if (!notice) return null;

    const expired = notice.code === 'subscription_expired';

    return (
        <Modal isOpen onClose={() => setNotice(null)} modalSize="sm" showCloseButton={false}>
            <div className="flex flex-col items-center gap-4 text-center py-2">
                <div className={`flex items-center justify-center w-14 h-14 rounded-full ${expired ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300' : 'bg-primary/10 text-primary dark:text-primarywhite'}`}>
                    {expired ? <FaRedo className="text-xl" /> : <FaLock className="text-xl" />}
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{titles[notice.code]}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{notice.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {expired ? 'Contacta a soporte para renovar tu suscripción.' : 'Contacta a soporte para actualizar tu plan.'}
                </p>
                <button
                    type="button"
                    onClick={() => setNotice(null)}
                    className="w-full mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primaryhover cursor-pointer transition-colors"
                    autoFocus
                >
                    Entendido
                </button>
            </div>
        </Modal>
    );
};
