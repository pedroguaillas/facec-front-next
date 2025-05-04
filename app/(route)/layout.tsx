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
        return <div className="text-center mt-8">Cargando sesión...</div>;
    }

    if (status === "unauthenticated") {
        return null; // ya redirigiste arriba
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Sidebar menu={menu} setMenu={setMenu} />
            <Header menu={menu} setMenu={setMenu} />
            {/* h-[calc(100vh-4em)] */}
            <div className="md:ml-[5rem] flex flex-col flex-1 min-h-[calc(h-screen - 4em)] overflow-auto dark:bg-gray-900">
                {children}
            </div>
        </div>
    );
}