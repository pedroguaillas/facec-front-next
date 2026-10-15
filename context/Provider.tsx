// app/layout.tsx
'use client'; // Ensure this is a client component

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './ToastContext';
import { StaleSessionGuard } from './StaleSessionGuard';

interface Props {
    children: React.ReactNode;
}

export default function Provider({ children }: Props) {
    return (
        <SessionProvider>
            <StaleSessionGuard />
            <ToastProvider>
                {children}
            </ToastProvider>
        </SessionProvider>
    );
}
