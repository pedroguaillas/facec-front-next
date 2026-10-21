"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Notice, Title } from "@/components";
import { useInventory } from "@/lib/hooks/useInventory";
import { ActionsTitle } from "@/types";

const tabs = [
    { label: 'Stock', href: '/inventory' },
    { label: 'Ajustes', href: '/inventory/adjustments' },
    { label: 'Transferencias', href: '/inventory/transfers' },
    { label: 'Inventario inicial', href: '/inventory/opening-balance' },
    { label: 'Bodegas', href: '/inventory/warehouses' },
    { label: 'Reportes', href: '/inventory/reports' },
];

interface Props {
    title: string;
    subTitle: string;
    actions?: ActionsTitle | ActionsTitle[];
    // Sin pestañas (ej. kardex de un producto)
    hideTabs?: boolean;
    children: ReactNode;
}

// Cabecera + pestañas del módulo; sin inventario activo muestra el aviso en vez del contenido
export const InventoryShell = ({ title, subTitle, actions, hideTabs = false, children }: Props) => {
    const pathname = usePathname();
    const { enabled, isLoading } = useInventory();

    return (
        <div className="dark:text-gray-300">
            <Title title={title} subTitle={subTitle} actions={enabled ? actions : null} />
            <div className="md:mx-8 py-4">
                {!isLoading && !enabled ? (
                    <Notice tone="info" title="El inventario no está activo para esta empresa.">
                        Solicita la activación del módulo de inventario (kardex) a soporte.
                    </Notice>
                ) : (
                    <>
                        {!hideTabs && (
                            <nav className="flex overflow-x-auto border-b border-line" aria-label="Inventario">
                                {tabs.map(tab => {
                                    const active = tab.href === '/inventory' ? pathname === tab.href : pathname.startsWith(tab.href);
                                    return (
                                        <Link
                                            key={tab.href}
                                            href={tab.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${active
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-ink-3 hover:text-primary'}`}
                                        >
                                            {tab.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                        {children}
                    </>
                )}
            </div>
        </div>
    );
};
