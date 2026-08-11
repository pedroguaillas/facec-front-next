import { ActionsTitle } from "@/types";
import Link from "next/link";
import { FaArrowLeft, FaPen, FaPencilAlt, FaPlus, FaPlusCircle, FaSave, FaSignInAlt, FaSpinner, FaTrash, FaUpload } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";

export const PrimaryButton = ({
    label,
    type = 'button',
    onClick,
    url = '/',
    isLoading,
    action
}: ActionsTitle) => {

    const color: Record<ActionsTitle['action'], string> = {
        'login': 'bg-primary hover:bg-primaryhover',
        'add': 'bg-primary hover:bg-primaryhover',
        'store': 'bg-primary hover:bg-primaryhover',
        'edit': 'bg-lime-600 hover:bg-lime-700',
        'import': 'bg-blue-600 hover:bg-blue-700',
        'export': 'bg-green-600 hover:bg-green-700',
        'delete': 'bg-danger hover:bg-dangerhover',
        'back': 'bg-slate-600 hover:bg-slate-700',
    }

    const baseClasses = `
        rounded-lg inline-flex justify-center items-center gap-2
        text-white text-sm font-medium
        transition-all duration-150 cursor-pointer
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    if (type === 'link')
        return (
            <Link
                className={`${baseClasses} w-full px-4 py-2 ${color[action]}`}
                href={url}
            >
                {!isLoading && action === 'add' && <FaPlus className="text-xs" />}
                {!isLoading && action === 'edit' && <FaPen className="text-xs" />}
                {!isLoading && action === 'back' && <FaArrowLeft className="text-xs" />}
                {label}
            </Link>
        )

    const icons: Record<ActionsTitle['action'], React.ElementType> = {
        login: FaSignInAlt,
        add: FaPlusCircle,
        store: FaSave,
        edit: FaPencilAlt,
        import: FaUpload,
        export: FaDownload,
        delete: FaTrash,
        back: FaArrowLeft,
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading}
            className={`${baseClasses} w-full px-4 py-2 ${color[action]}`}
        >
            {isLoading ? (
                <FaSpinner className="animate-spin text-sm" />
            ) : (
                (() => {
                    const IconComponent = icons[action];
                    return IconComponent ? <IconComponent className="text-sm" /> : null;
                })()
            )}
            {label}
        </button>
    )
}
