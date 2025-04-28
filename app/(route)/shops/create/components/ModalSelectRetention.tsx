"use client";

import { Modal } from '@/components/modal/Modal'
import { TableResponsive } from '@/components';
import React, { useState } from 'react'
import { useCreateShop } from '../context/ShopCreateContext';

interface Props {
  show: boolean;
  // handleSelect: (retention: TaxInput) => void;
  onClose: () => void; // Nuevo
}

const ModalSelectRetention = ({ show, onClose }: Props) => {

  const [search, setSearch] = useState('');
  const { taxInputs } = useCreateShop();

  // console.log(taxInputs);

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
        className="w-full mb-2 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className='max-h-[calc(100vh-20em)] overflow-y-auto'>

        <TableResponsive>
          <thead>
            <tr>
              <th className="hidden sm:block">#</th>
              <th>Código</th>
              <th className="text-left">Retención</th>
            </tr>
          </thead>
          <tbody>
            {taxInputs.map((tax, indexItem) => (
              <tr
                key={tax.code}
                className={`hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
                                    ${indexItem % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}`}
              >
                <td className="hidden sm:block">{indexItem + 1}</td>
                <td>{tax.code}</td>
                <td className="text-left">{tax.conception}</td>
              </tr>
            ))}
          </tbody>
        </TableResponsive>
      </div>

    </Modal>
  )
}

export default ModalSelectRetention;
