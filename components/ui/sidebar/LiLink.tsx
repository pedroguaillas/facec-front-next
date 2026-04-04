import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
    label: string;
    link: string;
    handleCloseSidebar: () => void;
    menuOpen: boolean;
    children: ReactNode;
}

export const LiLink = ({ label, link, handleCloseSidebar, menuOpen, children }: Props) => {

    const pathname = usePathname();
    const isActive = pathname.includes(link);

    return (
        <li>
            <Link
                href={link}
                className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-150
                    ${isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/25'
                        : 'text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]'
                    }
                `}
                onClick={handleCloseSidebar}
            >
                {children}
                <span className={`
                    whitespace-nowrap transition-opacity duration-200 truncate
                    ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}>
                    {label}
                </span>
            </Link>
        </li>
    )
}
