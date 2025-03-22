import React from 'react';

// Definición de la interfaz Props con tipado correcto
interface Props {
    type?: 'text' | 'email' | 'password' | 'number'; // Restringe los tipos válidos
    value: string;
    required?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Tipado correcto para onChange
    label: string;
    name: string;
    placeholder?: string; // Opcional para más flexibilidad
    disabled?: boolean;   // Opcional para deshabilitar el input
    className?: string;   // Opcional para clases personalizadas
}

export const TextInput = ({
    type = 'text', // Valor por defecto más explícito
    value,
    required,
    label,
    name,
    onChange,
    placeholder,
    disabled,
    className,
}: Props) => {
    return (
        <div className="flex flex-col gap-1 my-2">
            <label htmlFor={name} className="text-sm font-medium dark:text-primary">
                {label}
                {required && <span className="text-red-500">*</span>} {/* Indicador visual de requerido */}
            </label>
            <input
                // id={name} // Vincula el label con el input
                type={type}
                name={name} // Útil para formularios
                className={`border border-slate-400 rounded px-2 py-1 dark:text-primaryhover focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
                value={value}
                required={required}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                aria-required={required ? 'true' : 'false'} // Mejora de accesibilidad
                aria-disabled={disabled ? 'true' : 'false'} // Mejora de accesibilidad
            />
        </div>
    );
};