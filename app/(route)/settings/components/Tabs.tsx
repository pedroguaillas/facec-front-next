import Link from "next/link";

interface Props {
    activeTab?: 'general' | 'establecimientos';
}

export const Tabs = ({ activeTab = 'general' }: Props) => {
    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700" >
            <Link
                className={`px-4 py-2 font-medium ${activeTab === "general"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                    }`}
                    href={'/settings'}
            >
                Información General
            </Link>
            <Link
                className={`px-4 py-2 font-medium ${activeTab === "establecimientos"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                    }`}
                    href={'/settings/branches'}
            >
                Establecimientos
            </Link>
        </div>
    )
}
