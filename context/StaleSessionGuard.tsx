'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { usePlan } from '@/lib/hooks/usePlan';

// Sesiones iniciadas antes de las suscripciones no traen el plan en el JWT:
// se cierra la sesión para que el nuevo login lo incluya.
export const StaleSessionGuard = () => {
    const { isStale } = usePlan();

    useEffect(() => {
        if (isStale) signOut({ callbackUrl: '/login' });
    }, [isStale]);

    return null;
};
