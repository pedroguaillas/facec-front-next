import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
    label: string,
    link: string,
    handleCloseSidebar: () => void;
    children: ReactNode;
}

export const LiLink = ({ label, link, handleCloseSidebar, children }: Props) => {

    const pathname = usePathname();

    return (
        <li>
            <Link
                href={link}
                className={`rounded hover:bg-primaryhover flex gap-2 px-2 py-2 
                    ${pathname.includes(link) ? 'bg-primary' : ''}`}
                onClick={handleCloseSidebar}
            >
                {children}
                <h3>{label}</h3>
            </Link>
        </li>
    )
}
