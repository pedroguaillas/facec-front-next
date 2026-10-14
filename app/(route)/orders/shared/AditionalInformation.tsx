"use client";

import { AditionalInformation as AditionalInformationType } from '@/types/order';
import { ItemAditionalInformation } from './ItemAditionalInformation';
import { AddRowButton, FormSection, tableHead } from './FormSection';
import { useFormInvoice } from '../context/FormInvoiceContext';
import { nanoid } from 'nanoid';

const MAX_ADITIONALS = 13;

interface Props {
  // El SRI admite hasta 13; la factura recurrente hasta 10
  max?: number;
  hint?: string;
}

export const AditionalInformation = ({ max = MAX_ADITIONALS, hint }: Props) => {

  const { aditionalInformation, setAditionalInformation, errorAditionalInformation } = useFormInvoice();
  const canAdd = aditionalInformation.length < max;

  const addItem = () => {
    if (!canAdd) return;

    const newAnditionalInformation: AditionalInformationType = {
      id: nanoid(),
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
    <FormSection
      title="Información adicional"
      aside={aditionalInformation.length > 0 ? <span className="text-xs text-ink-3 tabular-nums">{aditionalInformation.length}/{max}</span> : undefined}
    >
      {hint && <p className="mb-2 text-xs text-ink-3">{hint}</p>}
      {aditionalInformation.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className={tableHead}>
              <th className="text-left w-2/5">Nombre</th>
              <th className="text-left">Descripción</th>
              <th className="w-11"><span className="sr-only">Acciones</span></th>
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
        </table>
      )}
      {canAdd && <AddRowButton label="Agregar campo (ej. Descripción)" onClick={addItem} />}
    </FormSection>
  )
}
