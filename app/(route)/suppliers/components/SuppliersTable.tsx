"use client";

import { Dialog, IconButton, TableResponsive } from "@/components";
import { useSuppliers } from "../context/SupplierContext";
import { axiosAuth } from "@/lib/axios";
import { deleteSupplier } from "../services/suppliersServices";

export const SuppliersTable = () => {
  const { suppliers, supplierDeleteId, fetchSuppliers, setSupplierDeleteId } = useSuppliers();

  const confirmation = (accept: boolean) => {
    if (accept) {
      deleteSupplier(supplierDeleteId ?? 0, axiosAuth).then(() => {
        setSupplierDeleteId(null);
        fetchSuppliers();
      });
    }
  };

  return (
    <>
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
                <div className="flex gap-2">
                  <IconButton type="link" action="edit" url={`/suppliers/${supplier.id}`} title="Editar" />
                  <IconButton type="button" action="delete" onClick={() => setSupplierDeleteId(supplier.id)} title="Eliminar" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableResponsive>
      <Dialog
        itemId={supplierDeleteId}
        confirmation={confirmation}
        title="¿Estás seguro de querer eliminar este proveedor?"
        sutTitle="Esta acción no se puede deshacer y eliminará el proveedor de forma permanente."
      />
    </>
  )
}
