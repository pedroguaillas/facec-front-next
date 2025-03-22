"use client";

import React, { Dispatch, SetStateAction } from "react";
import { signOut } from "next-auth/react";

interface Props {
    menu: boolean;
    setMenu: Dispatch<SetStateAction<boolean>>;
}

const Header = ({ menu, setMenu }: Props) => {
    return (
        <header className={`${menu ? 'ml-[16em] w-[calc(100%-16em)]' : 'ml-0 w-full'} ease-out duration-300 h-[4em] bg-gray-800 z-50 sticky flex justify-between items-center px-2`}>
            <button onClick={() => setMenu(!menu)} className="cursor-pointer">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 stroke-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
            <div className="text-white flex items-center gap-4">
                <h3>Peterio</h3>
                <button onClick={() => signOut()} className="cursor-pointer">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
