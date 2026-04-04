import { ChangeEvent } from "react";
import { LabelComponent } from "../label/LabelComponent";

interface OptionProps {
    value: number | string;
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
    required?: boolean;
}

export const SelectOption = ({ options, label, name, select = false, selectedValue, error, handleSelect, required }: Props) => {
    return (
        <div className="flex flex-col gap-1 my-2">
            <LabelComponent name={name} label={label} required={required} />
            <select
                // id={name} // Vincula el label con el input
                name={name} // Útil para formularios
                className={`border rounded-lg px-3 py-2 text-sm transition-colors duration-150 focus:outline-none bg-[var(--background)] ${error
                    ? "border-red-400 focus:border-red-500"
                    : "border-[var(--border-strong)] focus:border-primary"
                    } dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}
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
