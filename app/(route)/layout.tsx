"use client";

import Header from "@/components/ui/header/Header";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, ReactNode, useEffect } from "react";

interface MainProps {
    children: ReactNode;
}

export default function Main({ children }: MainProps) {

    const [menu, setMenu] = useState(false);
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primaryhover to-primary flex items-center justify-center">
                        <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <p className="text-sm text-[var(--foreground)] opacity-50">Cargando...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
            <Sidebar menu={menu} setMenu={setMenu} />
            <div className={`
                flex flex-col flex-1 min-h-screen
                transition-all ease-out duration-300
                ${menu ? 'md:ml-64' : 'md:ml-[4.5rem]'}
            `}>
                <Header menu={menu} setMenu={setMenu} />
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
