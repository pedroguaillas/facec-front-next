import { ChangeEvent } from "react";

interface OptionProps {
    value: number;
    label: string;
}

interface Props {
    options: OptionProps[];
    label: string;
    selectedValue: number; // Agregar prop para controlar el valor seleccionado
    handleSelect: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectOption = ({ options, label, selectedValue, handleSelect }: Props) => {
    return (
        <>
            <label htmlFor='voucher_type' className="text-sm font-medium dark:text-primary">
                {label}
            </label>
            <select
                // id={name} // Vincula el label con el input
                name='voucher_type' // Útil para formularios
                className={`border border-slate-400 rounded px-2 py-1 dark:text-primaryhover focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={selectedValue} // 🔹 Controlado por una prop externa
                required
                onChange={handleSelect}
            >
                {options.map(it => (
                    <option key={it.value} value={it.value}>{it.label}</option>
                ))}
            </select>
        </>
    )
}
