"use client";

import { useSession } from "next-auth/react";
import { LiLink } from "./LiLink";
import { useInventory } from "@/lib/hooks/useInventory";

interface Props {
    menu: boolean;
    setMenu: (value: boolean) => void;
}

const Sidebar = ({ menu, setMenu }: Props) => {

    const { data: session } = useSession();
    const { enabled: inventory } = useInventory();

    const handleCloseSidebar = () => {
        setMenu(false);
    };

    return (
        <>
            {/* Backdrop overlay - mobile only */}
            {menu && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] md:hidden z-50 transition-opacity duration-300"
                    onClick={handleCloseSidebar}
                />
            )}

            <aside
                className={`
                    group h-dvh flex flex-col fixed top-0 left-0 z-60
                    pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
                    transition-all ease-in-out duration-300
                    border-r border-[var(--border)]
                    md:hover:shadow-2xl md:hover:shadow-black/20
                    ${menu
                        ? "w-64 translate-x-0"
                        : "-translate-x-full md:translate-x-0 md:w-[4.5rem] md:hover:w-64"
                    }
                `}
                style={{ background: 'var(--sidebar-bg)' }}
            >
                {/* Logo */}
                <header className="h-16 px-5 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primaryhover to-primary flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <span
                        className={`
                            font-semibold text-lg tracking-tight text-white
                            transition-opacity duration-200
                            ${menu ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"}
                        `}
                    >
                        facec
                    </span>
                </header>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-2">
                    <ul className="flex flex-col gap-0.5">
                        {session?.user.user.user !== 'admin' ? (
                            <>
                                {/* Principal */}
                                <li className={`
                                    px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider
                                    transition-opacity duration-200
                                    ${menu ? "opacity-60" : "opacity-0 md:group-hover:opacity-60"}
                                `}
                                    style={{ color: 'var(--sidebar-text)' }}
                                >
                                    Principal
                                </li>
                                <LiLink label="Inicio" link="/dashboard" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 22 22" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Productos/Servicios" link="/products" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                </LiLink>
                                {inventory && (
                                    <LiLink label="Inventario" link="/inventory" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                        </svg>
                                    </LiLink>
                                )}

                                {/* Transacciones */}
                                <li className={`
                                    px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider
                                    transition-opacity duration-200
                                    ${menu ? "opacity-60" : "opacity-0 md:group-hover:opacity-60"}
                                `}
                                    style={{ color: 'var(--sidebar-text)' }}
                                >
                                    Transacciones
                                </li>
                                <LiLink label="Ventas" link="/orders" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Recurrentes" link="/recurring-invoices" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Compras" link="/shops" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Guias de remisión" link="/referralguides" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                                    </svg>
                                </LiLink>

                                {/* Contactos */}
                                <li className={`
                                    px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider
                                    transition-opacity duration-200
                                    ${menu ? "opacity-60" : "opacity-0 md:group-hover:opacity-60"}
                                `}
                                    style={{ color: 'var(--sidebar-text)' }}
                                >
                                    Contactos
                                </li>
                                <LiLink label="Clientes" link="/customers" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Proveedores" link="/suppliers" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Transportistas" link="/carriers" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                </LiLink>

                                {/* Tesorería */}
                                <li className={`
                                    px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider
                                    transition-opacity duration-200
                                    ${menu ? "opacity-60" : "opacity-0 md:group-hover:opacity-60"}
                                `}
                                    style={{ color: 'var(--sidebar-text)' }}
                                >
                                    Tesorería
                                </li>
                                <LiLink label="Movimientos" link="/movements" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Bancos" link="/banks" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3.75-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m-4.5 0h4.5m3-16.5-3 3m0 0-3-3m3 3V3" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Efectivo" link="/cash-registers" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 8.25v10.5A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V8.25M2.25 8.25V6a2.25 2.25 0 0 1 2.25-2.25h15A2.25 2.25 0 0 1 21.75 6v2.25M6 12.75h.008v.008H6v-.008Zm3 0h6" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Cartera vencida" link="/overdue" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-8.25 3h.008v.008h-.008V15Z" />
                                    </svg>
                                </LiLink>

                                {/* Herramientas */}
                                <li className={`
                                    px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider
                                    transition-opacity duration-200
                                    ${menu ? "opacity-60" : "opacity-0 md:group-hover:opacity-60"}
                                `}
                                    style={{ color: 'var(--sidebar-text)' }}
                                >
                                    Herramientas
                                </li>
                                <LiLink label="Reportes" link="/reports" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
                                    </svg>
                                </LiLink>
                                <LiLink label="Configuraciones" link="/settings" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </LiLink>
                            </>
                        ) : (
                            <>
                            <LiLink label="Compañias" link="/admin/companies" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </LiLink>
                            <LiLink label="Feriados" link="/admin/holidays" handleCloseSidebar={handleCloseSidebar} menuOpen={menu}>
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                            </LiLink>
                            </>
                        )}
                    </ul>
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;
