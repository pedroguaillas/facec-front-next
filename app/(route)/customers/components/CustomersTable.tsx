import { TableResponsive } from "@/components";
import { useCustomers } from "../context/CustomersContext";

export const CustomersTable = () => {

  const { customers } = useCustomers();

  return (
    <TableResponsive>
      <thead>
        <tr>
          <th className="text-left">Identificación</th>
          <th className="text-left">Nombre</th>
          <th className="text-left">Dirección</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer, index) => (
          <tr key={customer.id}
            className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}
          >
            <td className="text-left">{customer.atts.identication}</td>
            <td className="text-left">{customer.atts.name}</td>
            <td className="text-left">{customer.atts.address}</td>
          </tr>
        ))}
      </tbody>
    </TableResponsive>
  )
}
