import { PrimaryButton, TableResponsive } from "@/components";
import { useCustomers } from "../context/CustomersContext";

export const CustomersTable = () => {

  const { customers } = useCustomers();

  return (
    <TableResponsive>
      <thead>
        <tr>
          <th className="text-left">IDENTIFICACION</th>
          <th className="text-left">NOMBRE</th>
          <th className="text-left">DIRECCION</th>
          <th></th>
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
            <td className="w-1">
              <PrimaryButton type="link" label="" action="edit" url={`customers/${customer.id}`} />
            </td>
          </tr>
        ))}
      </tbody>
    </TableResponsive>
  )
}
