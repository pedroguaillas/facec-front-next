import Link from "next/link";
import { FaListUl, FaPen, FaTrash } from "react-icons/fa";

type IconButtonAction = "edit" | "delete" | "view";

type IconButtonProps = {
    action: IconButtonAction;
    type: "link" | "button";
    url?: string;
    onClick?: () => void;
    title?: string;
};

const icons: Record<IconButtonAction, React.ElementType> = {
    edit: FaPen,
    delete: FaTrash,
    view: FaListUl,
};

const color: Record<IconButtonAction, string> = {
    edit: "text-lime-600 hover:bg-lime-100 dark:hover:bg-lime-950",
    delete: "text-danger hover:bg-red-100 dark:hover:bg-red-950",
    view: "text-primary hover:bg-primary/10",
};

export const IconButton = ({ action, type, url = "/", onClick, title }: IconButtonProps) => {
    const Icon = icons[action];
    const baseClasses = `inline-flex items-center justify-center p-2 rounded-full transition-colors duration-150 cursor-pointer ${color[action]}`;

    if (type === "link")
        return (
            <Link href={url} className={baseClasses} title={title}>
                <Icon className="text-sm" />
            </Link>
        );

    return (
        <button type="button" onClick={onClick} className={baseClasses} title={title}>
            <Icon className="text-sm" />
        </button>
    );
};
