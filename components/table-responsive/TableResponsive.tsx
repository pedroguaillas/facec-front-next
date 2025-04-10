import React, { ReactNode } from "react"

interface TableProps {
    children: ReactNode
}

export const TableResponsive: React.FC<TableProps> = ({ children }) => (
    // overflow-visible
    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded md:p-4 mt-4 shadow-2xl">
        <table className="mt-4 text-xs sm:text-sm table-auto w-full text-center text-gray-700 dark:text-gray-300 [&>thead>tr>th]:p-2 [&>tbody>tr>td]:p-2">
            {children}
        </table>
    </div>
)