"use client";

import { useFormShop } from '../context/FormShopContext';
import { Modal } from '@/components/modal/Modal'
import { TableResponsive } from '@/components';
import React, { useEffect, useState } from 'react'
import { TaxInput } from '@/types';

interface Props {
  show: boolean;
  code: number;
  // Lo escrito en el buscador de la línea al abrir la lista completa
  initialSearch?: string;
  onClose: () => void;
  selectRetetion: (tax: TaxInput) => void;
}

const ModalSelectRetention = ({ show, code, initialSearch = '', onClose, selectRetetion }: Props) => {

  const [search, setSearch] = useState('');
  const { taxInputs } = useFormShop();

  useEffect(() => {
    if (show) setSearch(initialSearch);
  }, [show, initialSearch]);

  const filterTaxInputs = taxInputs.filter(retention => {
    const matchesType = code === 2 ? retention.type === 'iva' : retention.type === 'renta';
    const matchesSearch = retention.code.includes(search) || retention.conception.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });


  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="Seleccionar retención"
      modalSize="lg"
    >
      <input
        type="search"
        placeholder="Buscar retención ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        className="w-full mb-2 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Scroll */}
      <div className='max-h-[calc(100dvh-20em)] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-primary'>

        <TableResponsive>
          <thead>
            <tr>
              <th className="hidden sm:block">#</th>
              <th>Código</th>
              <th className="text-left">Retención</th>
            </tr>
          </thead>
          <tbody>
            {filterTaxInputs.map((taxInput, indexItem) => (
              <tr
                key={taxInput.code}
                onClick={() => selectRetetion(taxInput)}
                className={`hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
                                    ${indexItem % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900' : ''}`}
              >
                <td className="hidden sm:block">{indexItem + 1}</td>
                <td>{taxInput.code}</td>
                <td className="text-left">{taxInput.conception}</td>
              </tr>
            ))}
          </tbody>
        </TableResponsive>
      </div>

    </Modal>
  )
}

export default ModalSelectRetention;
