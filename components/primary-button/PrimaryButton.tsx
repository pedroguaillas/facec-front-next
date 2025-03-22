import { ActionsTitle } from "@/types";
import Link from "next/link";

export const PrimaryButton = ({
    label,
    type = 'button', // Valor por defecto más explícito
    onClick,
    url = '/',
    action
}: ActionsTitle) => {

    const color: Record<ActionsTitle['action'], string> = {
        'create': 'bg-green-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'edit': 'bg-lime-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'import': 'bg-blue-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'export': 'bg-green-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'delete': 'bg-red-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
    }

    if (type === 'link')
        return (
            <Link
                className={`w-full rounded px-2 py-1 text-white transition-colors duration-200 ${color[action]}`}
                href={url}
            >{label}</Link>
        )

    return (
        <button
            className={`w-full rounded px-2 py-1 text-white transition-colors duration-200 ${color[action]}`}
            onClick={onClick}
            type={type}
        >{label}</button>
    )
}
