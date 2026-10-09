"use client";

import { useId } from "react";

interface Option<T extends string> {
    label: string;
    value: T;
}

interface Props<T extends string> {
    label: string;
    name: string;
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
    disabled?: boolean;
}

// Grupo de radios con aspecto de botones segmentados (teclado: flechas para cambiar)
export const SegmentedControl = <T extends string>({ label, name, value, options, onChange, disabled }: Props<T>) => {
    const labelId = useId();

    return (
        <div className="flex flex-col gap-1.5 my-2">
            <span id={labelId} className="text-sm font-medium dark:text-gray-300">{label}</span>
            <div
                role="radiogroup"
                aria-labelledby={labelId}
                className="flex w-full sm:w-fit p-1 rounded-lg bg-gray-100 dark:bg-slate-900 border border-[var(--border)]"
            >
                {options.map(option => (
                    <label key={option.value} className="flex-1 sm:flex-none">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                            disabled={disabled}
                            className="peer sr-only"
                        />
                        <span className="block text-center px-4 py-1.5 text-sm rounded-md select-none cursor-pointer transition-colors duration-150
                            text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200
                            peer-checked:bg-white peer-checked:text-primary peer-checked:font-medium peer-checked:shadow-sm
                            dark:peer-checked:bg-slate-700 dark:peer-checked:text-primarywhite
                            peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40
                            peer-disabled:cursor-not-allowed peer-disabled:hover:text-gray-600 peer-disabled:opacity-70">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    )
}
