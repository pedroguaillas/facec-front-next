"use client";

import { ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaList, FaSearch } from 'react-icons/fa';

interface Props<T> {
    // Texto mostrado cuando no se está escribiendo (lo ya seleccionado)
    value: string;
    placeholder: string;
    ariaLabel: string;
    error?: string;
    fetchItems: (search: string) => Promise<T[]>;
    getKey: (item: T) => string;
    renderItem: (item: T) => ReactNode;
    onSelect: (item: T, search: string) => void;
    // Abre el modal con la lista completa (paginada) usando lo escrito como búsqueda
    onBrowse?: (search: string) => void;
    // Tras elegir, pasa el foco al siguiente campo (ej. cantidad de la línea)
    focusNextOnSelect?: boolean;
}

const DEBOUNCE_MS = 250;
const MAX_HEIGHT = 320;

const FOCUSABLE = 'input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])';

// Siguiente campo en orden del documento; se saltan los marcados con data-autocomplete-skip y los tabIndex -1
const focusNext = (from: HTMLElement) => {
    const form = from.closest('form') ?? document.body;
    const fields = Array.from(form.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(el => el.tabIndex >= 0 && !el.closest('[data-autocomplete-skip]'));
    fields[fields.indexOf(from) + 1]?.focus();
};

// Buscador con sugerencias: se escribe y se elige con flechas + Enter sin abrir el modal.
// Enter con la búsqueda aún en curso (lector de código de barras) espera el resultado y toma el primero
export const Autocomplete = <T,>({ value, placeholder, ariaLabel, error, fetchItems, getKey, renderItem, onSelect, onBrowse, focusNextOnSelect = false }: Props<T>) => {
    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    // null = no se está escribiendo: se muestra value
    const [query, setQuery] = useState<string | null>(null);
    const [items, setItems] = useState<T[]>([]);
    // Búsqueda a la que corresponden items (para saber si están desactualizados)
    const [itemsQuery, setItemsQuery] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [position, setPosition] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
    const requestId = useRef(0);

    const search = useCallback(async (term: string) => {
        const id = ++requestId.current;
        setLoading(true);
        const result = await fetchItems(term);
        // Una respuesta lenta de una búsqueda anterior no pisa la actual
        if (id !== requestId.current) return null;
        setItems(result);
        setItemsQuery(term);
        setActive(0);
        setLoading(false);
        return result;
    }, [fetchItems]);

    useEffect(() => {
        if (query === null || !query.trim()) return;
        const timer = setTimeout(() => search(query.trim()), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query, search]);

    const updatePosition = useCallback(() => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (!rect) return;
        const up = window.innerHeight - rect.bottom < MAX_HEIGHT && rect.top > window.innerHeight - rect.bottom;
        setPosition({ top: up ? rect.top - 4 : rect.bottom + 4, left: rect.left, width: rect.width, up });
    }, []);

    // La lista va en un portal (fixed) para no quedar recortada por tablas o modales con overflow
    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, updatePosition]);

    const close = () => {
        requestId.current++;
        setOpen(false);
        setQuery(null);
        setItems([]);
        setItemsQuery(null);
        setLoading(false);
    };

    const choose = (item: T) => {
        const term = query?.trim() ?? '';
        close();
        onSelect(item, term);
        const input = inputRef.current;
        if (focusNextOnSelect && input) {
            // Espera el render (ej. aparece el selector de presentación) antes de mover el foco
            requestAnimationFrame(() => focusNext(input));
        }
    };

    const browse = () => {
        const term = query?.trim() ?? '';
        close();
        onBrowse?.(term);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        const term = query?.trim() ?? '';
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!open) {
                    setOpen(true);
                    search(term);
                    return;
                }
                setActive(prev => Math.min(prev + 1, items.length - 1));
                return;
            case 'ArrowUp':
                e.preventDefault();
                setActive(prev => Math.max(prev - 1, 0));
                return;
            case 'Enter': {
                // Dentro de un form, Enter no debe enviarlo
                e.preventDefault();
                if (!term && !open) return;
                const fresh = itemsQuery === term && !loading ? items : await search(term);
                if (!fresh) return;
                const index = itemsQuery === term ? active : 0;
                if (fresh[index]) choose(fresh[index]);
                return;
            }
            case 'Escape':
                if (open || query !== null) {
                    e.preventDefault();
                    e.stopPropagation();
                    close();
                }
                return;
            case 'F2':
                if (onBrowse) {
                    e.preventDefault();
                    browse();
                }
                return;
        }
    };

    const term = query?.trim() ?? '';
    const showList = open && (term !== '' || items.length > 0);
    const stale = loading || itemsQuery !== term;

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label={ariaLabel}
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={showList && items[active] ? `${listId}-${active}` : undefined}
                aria-invalid={error ? 'true' : 'false'}
                autoComplete="off"
                value={query ?? value}
                placeholder={placeholder}
                onFocus={(e) => e.target.select()}
                // Click: muestra sugerencias sin escribir (primeros registros); con teclado, ↓ hace lo mismo
                onClick={() => {
                    if (open) return;
                    setOpen(true);
                    search(query?.trim() ?? '');
                }}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onBlur={close}
                className={`
                    w-full border rounded-lg pl-3 py-2 text-sm pointer-coarse:text-base
                    ${onBrowse ? 'pr-9' : 'pr-8'}
                    transition-colors duration-150
                    bg-[var(--background)] dark:text-gray-300
                    focus:outline-none focus:ring-2
                    ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-[var(--border-strong)] focus:border-primary focus:ring-primary/15'}
                `}
            />
            {onBrowse ? (
                <button
                    type="button"
                    tabIndex={-1}
                    title="Ver lista completa (F2)"
                    aria-label="Ver lista completa"
                    // mousedown: evita el blur del input antes del click
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={browse}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md text-xs opacity-50 hover:opacity-100 hover:bg-primary/10 cursor-pointer"
                >
                    <FaList />
                </button>
            ) : (
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-40 pointer-events-none" />
            )}

            {showList && position && createPortal(
                <ul
                    id={listId}
                    role="listbox"
                    style={{
                        position: 'fixed',
                        left: position.left,
                        width: Math.max(position.width, 280),
                        maxHeight: MAX_HEIGHT,
                        ...(position.up ? { bottom: window.innerHeight - position.top } : { top: position.top }),
                    }}
                    className="z-[110] overflow-y-auto rounded-lg border border-line bg-surface shadow-lg py-1 text-sm"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {items.map((item, index) => (
                        <li
                            key={getKey(item)}
                            id={`${listId}-${index}`}
                            role="option"
                            aria-selected={index === active}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => choose(item)}
                            className={`px-3 py-1.5 pointer-coarse:py-2.5 cursor-pointer ${index === active ? 'bg-primary/10 dark:bg-primary/20' : ''} ${stale ? 'opacity-60' : ''}`}
                        >
                            {renderItem(item)}
                        </li>
                    ))}
                    {items.length === 0 && (
                        <li className="px-3 py-2 text-ink-3">{stale ? 'Buscando...' : 'Sin resultados'}</li>
                    )}
                    {onBrowse && (
                        <li
                            onClick={browse}
                            className="px-3 py-1.5 pointer-coarse:py-3 pointer-coarse:text-sm mt-1 border-t border-line text-xs text-primary cursor-pointer hover:bg-primary/10"
                        >
                            {/* F2 solo tiene sentido con teclado físico; en táctil queda el texto con área de toque más grande */}
                            Ver lista completa<span className="pointer-coarse:hidden"> (F2)</span>
                        </li>
                    )}
                </ul>,
                document.body,
            )}
        </div>
    );
};
