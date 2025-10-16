"use client";

import { AditionalInformation as AditionalInformationType } from '@/types/order';
import { ItemAditionalInformation } from './ItemAditionalInformation';
import { PrimaryButton, TableResponsive } from '@/components';
import { useFormInvoice } from '../context/FormInvoiceContext';
import { nanoid } from 'nanoid';

export const AditionalInformation = () => {

  const { aditionalInformation, setAditionalInformation, errorAditionalInformation } = useFormInvoice();
  const id = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"

  const addItem = () => {
    if (aditionalInformation.length >= 15) {
      alert('No se puede registrar mas información adicional')
      return
    }

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
          <PrimaryButton onClick={addItem} label="Añadir" action="add" type="button" />
        </div>
      </div>
    </div>
  )
}
