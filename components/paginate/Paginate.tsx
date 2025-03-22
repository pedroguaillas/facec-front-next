import { PaginateProps } from "@/types/paginate";
import React from "react";

export const Paginate: React.FC<PaginateProps> = ({ meta, reqNewPage }) => {
    if (!meta || meta.last_page < 2) return null;

    const pageNumbers = Array.from({ length: meta.last_page }, (_, i) => i + 1);

    const { links } = meta

    return (
        <nav aria-label="Navegación de páginas" className="flex justify-center mt-4">
            <ul className="inline-flex items-center gap-1 text-sm">
                {/* Primera y Anterior */}
                <li>
                    <button
                        onClick={(e) => reqNewPage(e, links.first)}
                        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                        disabled={meta.current_page === 1}
                    >
                        {"<<"}
                    </button>
                </li>
                <li>
                    <button
                        onClick={(e) => reqNewPage(e, links.prev)}
                        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                        disabled={!links.prev}
                    >
                        {"<"}
                    </button>
                </li>

                {/* Páginas */}
                {pageNumbers
                    .filter((i) => Math.abs(meta.current_page - i) <= 4) // Mostrar +-4 páginas alrededor de la actual
                    .map((page) => (
                        <li key={page}>
                            <button
                                onClick={(e) => reqNewPage(e, `${meta.path}?page=${page}`)}
                                className={`px-3 py-1 rounded-md ${meta.current_page === page
                                    ? "bg-primary text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                            >
                                {page}
                            </button>
                        </li>
                    ))}

                {/* Siguiente y Última */}
                <li>
                    <button
                        onClick={(e) => reqNewPage(e, links.next)}
                        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                        disabled={!links?.next}
                    >
                        {">"}
                    </button>
                </li>
                <li>
                    <button
                        onClick={(e) => reqNewPage(e, links?.last)}
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