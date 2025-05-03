import React from 'react';

// Definición de la interfaz Props con tipado correcto
interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'month'; // Restringe los tipos válidos
    value: string;
    required?: boolean;
    label: string;
    name: string;
    maxLength?: number; // Opcional para limitar la longitud del input
    placeholder?: string; // Opcional para más flexibilidad
    disabled?: boolean;   // Opcional para deshabilitar el input
    className?: string;   // Opcional para clases personalizadas
    error?: string; // 👉 Nuevo campo para mostrar errores
    min?: string;
    max?: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Tipado correcto para onChange
}

export const TextInput = ({
    type = 'text', // Valor por defecto más explícito
    value,
    required,
    label,
    name,
    maxLength,
    placeholder,
    disabled,
    className,
    error, // 👉 Nuevo campo para mostrar errores
    onChange,
    min,
    max,
}: Props) => {
    return (
        <div className="flex flex-col gap-1 my-2">
            <label htmlFor={name} className="text-sm font-medium dark:text-gray-300">
                {label}
                {required && <span className="text-red-500">*</span>} {/* Indicador visual de requerido */}
            </label>
            <input
                // id={name} // Vincula el label con el input
                type={type}
                name={name} // Útil para formularios
                // className={`border border-slate-400 rounded px-2 py-1 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
                className={`border rounded px-2 py-1 focus:outline-none focus:ring-2 
                    ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-400 focus:ring-blue-500'} 
                    dark:text-gray-300 ${className || ''}`}
                value={value}
                maxLength={maxLength} // Limita la longitud del input
                required={required}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                aria-required={required ? 'true' : 'false'} // Mejora de accesibilidad
                aria-disabled={disabled ? 'true' : 'false'} // Mejora de accesibilidad
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};