import { PrimaryButton, TableResponsive } from "@/components";
import { useSuppliers } from "../context/SupplierContext";

export const SuppliersTable = () => {
  const { suppliers } = useSuppliers();
  return (
    <TableResponsive>
      <thead>
        <tr>
          <th className="w-10">Identificación</th>
          <th className="text-left">Nombre</th>
          <th className="text-left">Dirección</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((supplier, index) => (
          <tr key={supplier.id}
            className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}
          >
            <td>{supplier.atts.identication}</td>
            <td className="text-left">{supplier.atts.name}</td>
            <td className="text-left">{supplier.atts.address}</td>
            <td className="w-1">
              <PrimaryButton type="link" label="" action="edit" url={`suppliers/${supplier.id}`} />
            </td>
          </tr>
        ))}
      </tbody>
    </TableResponsive>
  )
}
