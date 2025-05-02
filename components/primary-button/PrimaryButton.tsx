import { ActionsTitle } from "@/types";
import Link from "next/link";
import { FaPen, FaPencilAlt, FaPlus, FaPlusCircle, FaSave, FaSpinner, FaUpload } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";

export const PrimaryButton = ({
    label,
    type = 'button', // Valor por defecto más explícito
    onClick,
    url = '/',
    isLoading,
    action
}: ActionsTitle) => {

    const color: Record<ActionsTitle['action'], string> = {
        'add': 'bg-primary dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'store': 'bg-primary dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'edit': 'bg-lime-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'import': 'bg-blue-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'export': 'bg-green-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
        'delete': 'bg-red-600 dark:bg-primary dark:hover:bg-primaryhover hover:bg-green-700',
    }

    if (type === 'link')
        return (
            <Link
                className={`w-full rounded p-2 inline-flex justify-center items-center gap-2 text-white transition-colors duration-200 cursor-pointer ${color[action]}`}
                href={url}
            >
                {!isLoading && action === 'add' && (
                    <FaPlus />
                )}
                {!isLoading && action === 'edit' && (
                    <FaPen />
                )}
                {label}
            </Link>
        )

    return (
        <button
            className={`w-full rounded px-2 py-1 inline-flex justify-center items-center gap-2 text-white transition-colors duration-200 cursor-pointer ${color[action]}`}
            onClick={onClick}
            type={type}
            disabled={isLoading}
        >
            {isLoading && (
                <FaSpinner className="animate-spin" />
            )}
            {!isLoading && action === 'add' && (
                <FaPlusCircle />
            )}
            {!isLoading && action === 'store' && (
                <FaSave />
            )}
            {!isLoading && action === 'edit' && (
                <FaPencilAlt />
            )}
            {!isLoading && action === 'import' && (
                <FaUpload />
            )}
            {!isLoading && action === 'export' && (
                <FaDownload />
            )}
            {label}
        </button>
    )
}
