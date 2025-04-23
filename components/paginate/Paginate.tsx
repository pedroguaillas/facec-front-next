import { PaginateProps } from "@/types/paginate";
import React from "react";

export const Paginate: React.FC<PaginateProps> = ({ meta, links, reqNewPage }) => {
    if (!meta || meta.last_page < 2 || links === null) return null;

    const getVisiblePages = () => {
        const pages: number[] = [];

        const total = meta.last_page;
        const current = meta.current_page;

        let start = 1;
        let end = 5;

        if (current <= 3) {
            start = 1;
            end = Math.min(5, total);
        } else if (current >= total - 2) {
            start = Math.max(total - 4, 1);
            end = total;
        } else {
            start = current - 2;
            end = current + 2;
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <nav aria-label="Navegación de páginas" className="flex justify-center mt-4">
            <ul className="inline-flex items-center gap-1 text-sm">

                {/* Primera página */}
                <li>
                    <button
                        onClick={(e) => reqNewPage(e, links.first)}
                        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                        disabled={meta.current_page === 1}
                    >
                        {"<<"}
                    </button>
                </li>

                {/* Botones de páginas */}
                {visiblePages.map((page) => (
                    <li key={page}>
                        <button
                            onClick={(e) => reqNewPage(e, `${meta.path}?page=${page}`)}
                            className={`px-3 py-1 rounded-md ${
                                meta.current_page === page
                                    ? "bg-primary dark:bg-slate-600 text-white"
                                    : "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
                            }`}
                        >
                            {page}
                        </button>
                    </li>
                ))}

                {/* Última página */}
                <li>
                    <button
                        onClick={(e) => reqNewPage(e, links.last)}
                        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                        disabled={meta.current_page === meta.last_page}
                    >
                        {">>"}
                    </button>
                </li>
            </ul>
        </nav>
    );
};
