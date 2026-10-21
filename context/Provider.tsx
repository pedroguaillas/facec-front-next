// app/layout.tsx
'use client'; // Ensure this is a client component

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './ToastContext';
import { StaleSessionGuard } from './StaleSessionGuard';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

interface Props {
    children: React.ReactNode;
}

export default function Provider({ children }: Props) {
    return (
        <SessionProvider>
            <StaleSessionGuard />
            <ServiceWorkerRegister />
            <ToastProvider>
                {children}
            </ToastProvider>
        </SessionProvider>
    );
}
