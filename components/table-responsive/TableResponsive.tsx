import React, { ReactNode } from "react"

interface TableProps {
    children: ReactNode
}

export const TableResponsive: React.FC<TableProps> = ({ children }) => (
    <div
        className="w-full my-4 rounded-xl border md:p-4 lg:p-6"
        style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
        }}
    >
        <div className="w-full overflow-x-auto relative">
            <table className="text-xs sm:text-sm table-auto w-full text-center text-gray-700 dark:text-gray-300 [&>thead>tr>th]:p-2.5 [&>tbody>tr>td]:p-2.5 [&>thead>tr>th]:font-medium [&>thead>tr>th]:text-xs [&>thead>tr>th]:uppercase [&>thead>tr>th]:tracking-wider [&>thead>tr>th]:opacity-60">
                {children}
            </table>
        </div>
    </div>
)
