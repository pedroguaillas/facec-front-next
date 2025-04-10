"use client";

import { PrimaryButton, TableResponsive } from '@/components';
import { useCreateInvoice } from '../../context/InvoiceCreateContext';
import { ItemAditionalInformation } from './ItemAditionalInformation';

export const AditionalInformation = () => {

  const { aditionalInformation, setAditionalInformation } = useCreateInvoice();

  const addItem = () => {
    const newAnditionalInformation: AditionalInformation = {
      id: Date.now(),
      name: '',
      description: '',
    }
    setAditionalInformation((prev) => ([...prev, newAnditionalInformation]));
  }

  // Modificar nombre o description
  const updateItem = (index: number, field: "name" | "description", value: string) => {
    aditionalInformation[index][field] = value;
    setAditionalInformation(aditionalInformation);
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
            <th className="border border-gray-300 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {aditionalInformation.map((aditional, index) => (
            <ItemAditionalInformation key={aditional.id} index={index} aditionalInformation={aditional} updateItem={updateItem} removeItem={removeItem} />
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
