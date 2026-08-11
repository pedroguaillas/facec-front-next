"use client";

import { Dialog, IconButton, TableResponsive } from "@/components";
import { useCustomers } from "../context/CustomersContext";
import { axiosAuth } from "@/lib/axios";
import { deleteCustomer } from "../services/customersServices";

export const CustomersTable = () => {

  const { customers, customerDeleteId, fetchCustomers, setCustomerDeleteId } = useCustomers();

  const confirmation = (accept: boolean) => {
    if (accept) {
      deleteCustomer(customerDeleteId ?? 0, axiosAuth).then(() => {
        setCustomerDeleteId(null);
        fetchCustomers();
      });
    }
  };

  return (
    <>
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
                <div className="flex gap-2">
                  <IconButton type="link" action="edit" url={`/customers/${customer.id}`} title="Editar" />
                  <IconButton type="button" action="delete" onClick={() => setCustomerDeleteId(customer.id)} title="Eliminar" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableResponsive>
      <Dialog
        itemId={customerDeleteId}
        confirmation={confirmation}
        title="¿Estás seguro de querer eliminar este cliente?"
        sutTitle="Esta acción no se puede deshacer y eliminará el cliente de forma permanente."
      />
    </>
  )
}
