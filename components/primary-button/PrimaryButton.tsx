import { ActionsTitle } from "@/types";
import Link from "next/link";
import { FaArrowLeft, FaPen, FaPlus, FaSave, FaSignInAlt, FaSpinner, FaTrash, FaUpload } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";

interface Props extends ActionsTitle {
    // En la cabecera (Title): ancho según el texto y en celular solo el ícono
    compact?: boolean;
}

// Primarias llenas (crear, guardar); secundarias con borde para no competir con la principal
const color: Record<ActionsTitle['action'], string> = {
    login: 'bg-primary text-white hover:bg-primaryhover',
    add: 'bg-primary text-white hover:bg-primaryhover',
    store: 'bg-primary text-white hover:bg-primaryhover',
    edit: 'bg-lime-600 text-white hover:bg-lime-700',
    import: 'border border-line-strong bg-surface text-ink-2 hover:bg-surface-sunken hover:text-ink-1',
    export: 'border border-line-strong bg-surface text-ink-2 hover:bg-surface-sunken hover:text-ink-1',
    delete: 'bg-danger text-white hover:bg-dangerhover',
    back: 'border border-line-strong bg-surface text-ink-2 hover:bg-surface-sunken hover:text-ink-1',
};

const icons: Record<ActionsTitle['action'], React.ElementType> = {
    login: FaSignInAlt,
    add: FaPlus,
    store: FaSave,
    edit: FaPen,
    import: FaUpload,
    export: FaDownload,
    delete: FaTrash,
    back: FaArrowLeft,
};

export const PrimaryButton = ({
    label,
    type = 'button',
    onClick,
    url = '/',
    isLoading,
    action,
    disabled,
    title,
    compact = false,
}: Props) => {

    const Icon = icons[action];
    // Sin texto visible el botón igual necesita nombre para lectores de pantalla
    const accessibleName = label || title;
    const classes = `
        inline-flex justify-center items-center gap-2 rounded-lg
        text-sm font-medium whitespace-nowrap
        transition-all duration-150 cursor-pointer active:scale-[0.98]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${compact ? 'h-9 w-9 sm:w-auto sm:px-3.5' : 'w-full px-4 py-2'}
        ${color[action]}
    `;
    const content = (
        <>
            {isLoading
                ? <FaSpinner className="animate-spin text-sm" aria-hidden="true" />
                : <Icon className="text-xs shrink-0" aria-hidden="true" />}
            {label && <span className={compact ? 'hidden sm:inline' : undefined}>{label}</span>}
        </>
    );

    if (type === 'link' && !disabled)
        return (
            <Link className={classes} href={url} title={title ?? (compact ? label : undefined)} aria-label={compact ? accessibleName : undefined}>
                {content}
            </Link>
        );

    return (
        <button
            type={type === 'link' ? 'button' : type}
            onClick={onClick}
            disabled={isLoading || disabled}
            title={title ?? (compact ? label : undefined)}
            aria-label={compact ? accessibleName : undefined}
            className={classes}
        >
            {content}
        </button>
    );
};
