'use client'

import Header from "@/components/ui/header/Header";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import Provider from "@/context/Provider";
import { useState, ReactNode } from "react";

interface MainProps {
    children: ReactNode;
}

export default function Main({ children }: MainProps) {

    const [menu, setMenu] = useState(false);

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            <Sidebar menu={menu} setMenu={setMenu} />
            <Header menu={menu} setMenu={setMenu} />
            {/* h-[calc(100vh-4em)] */}
            <div className="md:ml-[5rem] flex flex-col flex-1 min-h-screen overflow-auto dark:bg-gray-900">
                <Provider>
                    {children}
                </Provider>
            </div>
        </div>
    );
}