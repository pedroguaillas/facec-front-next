"use client";

import { Modal } from '@/components/modal/Modal'
import { TableResponsive } from '@/components';
import React, { useState } from 'react'
import { SriCategory } from '@/types';
import { useProductCreateContext } from '../context/ProductFormContext';

interface Props {
  show: boolean;
  onClose: () => void;
  selectSriCategory: (sriCategory: SriCategory) => void;
}

const SelectModalSriCategory = ({ show, onClose, selectSriCategory }: Props) => {

  const [search, setSearch] = useState('');
  const { product, sriCategories, transport } = useProductCreateContext();

  const filterSriCategories = sriCategories.filter((sriCategory: SriCategory) => {
    const matchesSearch = sriCategory.code.includes(search) || sriCategory.description.toLowerCase().includes(search.toLowerCase());

    // ✅ Lógica del tipo según flags
    const matchesType =
      (product.iva === 5 && sriCategory.type === 'ferreteria') ||
      (transport && sriCategory.type === 'transporte') ||
      // Si ambos son true, mostramos ambos tipos
      (product.iva === 5 && transport);

    return matchesSearch && matchesType;
  });

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="Seleccionar categoría"
      modalSize="lg"
    >
      <input
        type="search"
        placeholder="Buscar categoría ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-2 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Scroll */}
      <div className='max-h-[calc(100vh-20em)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary'>

        <TableResponsive>
          <thead>
            <tr>
              <th className="hidden sm:block">#</th>
              <th>Código</th>
              <th className="text-left">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {filterSriCategories.map((sriCategory: SriCategory, indexItem) => (
              <tr
                key={sriCategory.code}
                onClick={() => selectSriCategory(sriCategory)}
                className={`hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
                                    ${indexItem % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900' : ''}`}
              >
                <td className="hidden sm:block">{indexItem + 1}</td>
                <td>{sriCategory.code}</td>
                <td className="text-left">{sriCategory.description}</td>
              </tr>
            ))}
          </tbody>
        </TableResponsive>
      </div>

    </Modal>
  )
}

export default SelectModalSriCategory;
