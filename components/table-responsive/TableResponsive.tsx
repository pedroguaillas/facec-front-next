import React, { ReactNode } from "react"

interface TableProps {
    children: ReactNode
}

export const TableResponsive: React.FC<TableProps> = ({ children }) => (
    <div
        className="w-full my-4 rounded-xl border border-line bg-surface md:p-4 lg:p-6"
    >
        <div className="w-full overflow-x-auto relative">
            <table className="text-xs sm:text-sm table-auto w-full text-center text-ink-1 [&>tbody>tr]:border-t [&>tbody>tr]:border-line [&>tbody>tr]:transition-colors [&>tbody>tr:hover]:bg-surface-hover [&>thead>tr>th]:py-1.5 [&>thead>tr>th]:px-2.5 [&>tbody>tr>td]:py-2.5 [&>tbody>tr>td]:px-2.5 [&>thead>tr>th]:font-medium [&>thead>tr>th]:text-xs [&>thead>tr>th]:uppercase [&>thead>tr>th]:tracking-wider [&>thead>tr>th]:text-ink-3 [&>thead>tr>th]:pb-2.5">
                {children}
            </table>
        </div>
    </div>
)
