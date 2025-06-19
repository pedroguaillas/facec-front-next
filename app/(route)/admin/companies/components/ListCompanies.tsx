"use client";

import { TableResponsive } from "@/components"
import { useCompanies } from "../context/CompaniesContext"

export const ListCompanies = () => {

  const { companies } = useCompanies()

  return (
    <TableResponsive>
      <thead>
        <tr>
          <th>#</th>
          <th>RUC</th>
          <th className="text-left">Razon Social</th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company, index) => (
          <tr key={company.id}
            className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}
          >
            <td>{index + 1}</td>
            <td>{company.ruc}</td>
            <td className="text-left">{company.company}</td>
          </tr>
        ))}
      </tbody>
    </TableResponsive>
  )
}
