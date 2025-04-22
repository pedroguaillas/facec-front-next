import { ChangeEvent } from "react";

interface OptionProps {
    value: number;
    label: string;
}

interface Props {
    options: OptionProps[];
    label: string;
    name: string;
    select?: boolean;
    selectedValue: string | number; // Agregar prop para controlar el valor seleccionado
    handleSelect: (event: ChangeEvent<HTMLSelectElement>) => void;
    error?: string; // 🔴 Nueva prop opcional para error
}

export const SelectOption = ({ options, label, name, select = false, selectedValue, error, handleSelect }: Props) => {
    return (
        <div className="flex flex-col gap-1 my-2">
            <label htmlFor={name} className="text-sm font-medium dark:text-gray-300">
                {label}
            </label>
            <select
                // id={name} // Vincula el label con el input
                name={name} // Útil para formularios
                className={`border rounded px-2 py-1 focus:outline-none focus:ring-2 ${error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-400 focus:ring-blue-500"
                    } dark:text-gray-300`}
                value={selectedValue} // 🔹 Controlado por una prop externa
                required
                onChange={handleSelect}
            >
                {select && <option value="">Seleccione</option>}
                {options.map(it => (
                    <option key={it.value} value={it.value}>{it.label}</option>
                ))}
            </select>
            {error && (<span className="text-sm text-red-500">{error}</span>)}
        </div>
    )
}
