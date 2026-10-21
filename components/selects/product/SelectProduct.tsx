"use client";

import { ProductPresentation, ProductProps } from '@/types';
import { formatFactor } from '@/helpers/presentationHelper';
import { useModalSelectProduct } from './hooks/useModalSelectProduct';
import { Modal, TableResponsive, Paginate } from "@/components";
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { getProducts } from '@/services/productServices';
import { useState, useEffect, useCallback } from 'react';
import { Autocomplete } from '../autocomplete/Autocomplete';

interface Props {
    label?: string;
    error?: string;
    index: number;
    // search: texto buscado en el modal (preselección de presentación por código)
    // presentation: fila elegida (null = unidad base); solo llega con withPresentations
    selectProduct: (index: number, product: ProductProps, search?: string, presentation?: ProductPresentation | null) => void;
    onlyProducts?: boolean;
    // Una fila por presentación (Unidad + cada presentación con su factor). Solo ventas/compras:
    // inventario y guías trabajan en unidad base
    withPresentations?: boolean;
}

interface SuggestionRow {
    key: string;
    product: ProductProps;
    // undefined: fila única del producto; null: unidad base; objeto: presentación
    presentation?: ProductPresentation | null;
}

const PRODUCT_TYPE = 1;
const SERVICE_TYPE = 2;

const formatPrice = (price: number | string) => Number(price).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

// Producto sin presentaciones (o servicio) = una fila; con presentaciones = Unidad + una fila por presentación
const buildRows = (products: ProductProps[], withPresentations: boolean): SuggestionRow[] =>
    products.flatMap((product) => {
        const presentations = product.presentations ?? [];
        if (!withPresentations || product.atts.type_product === SERVICE_TYPE || presentations.length === 0) {
            return [{ key: `${product.id}`, product }];
        }
        return [
            { key: `${product.id}-u`, product, presentation: null },
            ...presentations.map((presentation) => ({ key: `${product.id}-${presentation.id}`, product, presentation })),
        ];
    });

export const SelectProduct = ({ label, error, index, selectProduct, onlyProducts = false, withPresentations = false }: Props) => {

    const [displayValue, setDisplayValue] = useState(label ?? "");

    function handleSelect(product: ProductProps, search: string, presentation?: ProductPresentation | null) {
        setDisplayValue(`${product.atts.code} - ${product.atts.name}`);
        selectProduct(index, product, search, presentation);
    }

    const { isOpen, search, meta, links, suggestions, setSearch, toggle, fetchProduct, handleSelectLocal: modalSelect } = useModalSelectProduct(handleSelect, onlyProducts);
    const axiosAuth = useAxiosAuth();

    const fetchRows = useCallback(async (term: string) => {
        let url = `products?page=1&paginate=8&search=${encodeURIComponent(term)}`;
        if (onlyProducts) url += `&type=${PRODUCT_TYPE}`;
        const { data } = await getProducts(axiosAuth, url);
        return buildRows(data?.data ?? [], withPresentations);
    }, [axiosAuth, onlyProducts, withPresentations]);

    const browse = (term: string) => {
        toggle();
        setSearch(term);
    };

    useEffect(() => {
        if (label) setDisplayValue(label);
    }, [label]);

    const rows = buildRows(suggestions, withPresentations);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchProduct(pageUrl);
    };

    return (
        <div className='flex flex-col w-full'>
            <Autocomplete<SuggestionRow>
                value={displayValue}
                placeholder="Buscar producto por código o nombre..."
                ariaLabel={`Producto línea ${index + 1}`}
                error={error}
                fetchItems={fetchRows}
                getKey={(row) => row.key}
                renderItem={({ product, presentation }) => (
                    <div className="flex items-baseline gap-2">
                        <span className="shrink-0 text-xs text-ink-3 tabular-nums">{presentation?.code || product.atts.code}</span>
                        <span className="flex-1 truncate">
                            {product.atts.name}
                            {presentation !== undefined && (
                                <span className="text-ink-3"> · {presentation === null ? 'Unidad' : `${presentation.name} (x${formatFactor(presentation.conversion_factor)})`}</span>
                            )}
                        </span>
                        {withPresentations && (
                            <span className="shrink-0 text-xs tabular-nums">${formatPrice(presentation ? presentation.price : product.atts.price1)}</span>
                        )}
                    </div>
                )}
                onSelect={(row, term) => handleSelect(row.product, term, row.presentation)}
                onBrowse={browse}
                focusNextOnSelect
            />

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Seleccionar producto"
                modalSize="lg"
            >
                <input
                    type="search"
                    placeholder="Buscar por código o nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full mb-2 border rounded-lg px-3 py-2 text-sm bg-[var(--background)] border-[var(--border-strong)] focus:border-primary focus:outline-none dark:text-gray-300"
                />

                <div className="min-h-[260px] sm:min-h-[420px]">
                    <TableResponsive>
                        <thead>
                            <tr>
                                <th className="hidden sm:block">#</th>
                                <th>Código</th>
                                <th className="text-left">Producto/Servicio</th>
                                {withPresentations && <th className="text-left">Presentación</th>}
                                {withPresentations && <th className="text-right">Precio</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ key, product, presentation }, indexItem) => (
                                <tr
                                    key={key}
                                    onClick={() => modalSelect(product, presentation)}
                                    className={`hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer transition-colors
                                    ${indexItem % 2 === 0 ? 'bg-[var(--background)]' : ''}`}
                                >
                                    <td className="hidden sm:block">{indexItem + 1}</td>
                                    <td>{presentation?.code || product.atts.code}</td>
                                    <td className="text-left">{product.atts.name}</td>
                                    {withPresentations && (
                                        <td className="text-left whitespace-nowrap">
                                            {presentation === undefined
                                                ? <span className="opacity-40">—</span>
                                                : presentation === null
                                                    ? 'Unidad (x1)'
                                                    : `${presentation.name} (x${formatFactor(presentation.conversion_factor)})`}
                                        </td>
                                    )}
                                    {withPresentations && (
                                        <td className="text-right whitespace-nowrap">{formatPrice(presentation ? presentation.price : product.atts.price1)}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </TableResponsive>
                </div>

                <div className="flex justify-center">
                    <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
                </div>
            </Modal>
        </div>
    );
};
