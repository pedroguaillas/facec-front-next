// app/layout.tsx
'use client'; // Ensure this is a client component

import { SessionProvider } from 'next-auth/react';

interface Props {
    children: React.ReactNode;
}

export default function Provider({ children }: Props) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}
