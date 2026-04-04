"use client";

import React, { Dispatch, SetStateAction } from "react";
import { signOut, useSession } from "next-auth/react";

interface Props {
    menu: boolean;
    setMenu: Dispatch<SetStateAction<boolean>>;
}

const Header = ({ menu, setMenu }: Props) => {

    const { data: session, status } = useSession();
    const userName = status === 'authenticated' ? session?.user?.user?.user : "Usuario";

    return (
        <header
            className="
                h-14 z-40 sticky top-0
                flex justify-between items-center px-4
                border-b
            "
            style={{
                background: 'var(--header-bg)',
                borderColor: 'var(--header-border)',
            }}
        >
            {/* Left: Menu toggle */}
            <button
                onClick={() => setMenu(!menu)}
                className="p-2 -ml-2 rounded-lg transition-colors duration-150 cursor-pointer hover:bg-[var(--border)]"
            >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--foreground)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>

            {/* Right: User section */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs font-semibold">
                            {userName?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block">
                        {userName}
                    </span>
                </div>
                <div className="w-px h-5 bg-[var(--border)]" />
                <button
                    onClick={() => signOut()}
                    className="p-2 rounded-lg transition-colors duration-150 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 group"
                    title="Cerrar sesión"
                >
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5 text-[var(--foreground)] opacity-60 group-hover:text-danger group-hover:opacity-100 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
