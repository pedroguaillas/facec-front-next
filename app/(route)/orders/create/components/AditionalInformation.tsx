"use client";

import { PrimaryButton, TableResponsive } from '@/components';
import { useCreateInvoice } from '../../context/InvoiceCreateContext';
import { ItemAditionalInformation } from './ItemAditionalInformation';
import { nanoid } from 'nanoid';
import { AditionalInformation as AditionalInformationType } from '@/types/order';

export const AditionalInformation = () => {

  const { aditionalInformation, setAditionalInformation, errorAditionalInformation } = useCreateInvoice();
  const id = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"

  const addItem = () => {
    const newAnditionalInformation: AditionalInformationType = {
      id,
      name: '',
      description: '',
    }
    setAditionalInformation((prev) => ([...prev, newAnditionalInformation]));
  }

  // Modificar nombre o description
  const updateItem = (index: number, field: "name" | "description", value: string) => {
    const updated = [...aditionalInformation]; // Copia del array
    updated[index] = { ...updated[index], [field]: value }; // Copia del objeto y actualiza campo
    setAditionalInformation(updated); // Actualiza el estado
  };

  // Eliminar informacion adicional
  const removeItem = (index: number) => {
    setAditionalInformation((prev) => (
      prev.filter((_, indexInfo) => indexInfo !== index)
    ));
  };

  return (
    <div className='w-full'>
      <TableResponsive>
        <thead>
          <tr className="[&>th]:p-2">
            <th className="border border-gray-300" colSpan={3}>Información Adicional</th>
          </tr>
          <tr className="[&>th]:p-2">
            <th className="border border-gray-300">Nombre</th>
            <th className="border border-gray-300">Descripción</th>
            <th className="border border-gray-300"></th>
          </tr>
        </thead>
        <tbody>
          {aditionalInformation.map((aditional, index) => (
            <ItemAditionalInformation
              key={aditional.id} index={index}
              aditionalInformation={aditional}
              error={errorAditionalInformation[aditional.id]} // 🔴 pasamos errores por ID
              updateItem={updateItem} removeItem={removeItem}
            />
          ))}
        </tbody>
      </TableResponsive>
      <div className="flex justify-end mt-2">
        <div className="w-28">
          <PrimaryButton onClick={addItem} label="Agregar" action="create" type="button" />
        </div>
      </div>
    </div>
  )
}
