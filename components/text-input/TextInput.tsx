"use client";

import { ReactNode, useId } from 'react';
import { LabelComponent } from '../label/LabelComponent';

interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'month' | 'tel';
    value: string;
    required?: boolean;
    label: string;
    name: string;
    id?: string;
    maxLength?: number;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    autoFocus?: boolean;
    className?: string;
    // Clases del contenedor del input (ej. limitar el ancho sin afectar los mensajes)
    fieldClassName?: string;
    error?: string;
    success?: string;
    // Texto de ayuda bajo el campo (se oculta si hay error o success)
    hint?: string;
    // Muestra el contador `largo/maxLength`
    showCount?: boolean;
    // Elemento dentro del input a la derecha (spinner, ícono, etc.)
    endAdornment?: ReactNode;
    // Espacio reservado a la derecha para el adorno (por defecto pr-9)
    endAdornmentPadding?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    autoComplete?: string;
    min?: string;
    max?: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export const TextInput = ({
    type = 'text',
    value,
    required,
    label,
    name,
    id,
    maxLength,
    placeholder,
    disabled,
    readOnly,
    autoFocus,
    className,
    fieldClassName,
    error,
    success,
    hint,
    showCount,
    endAdornment,
    endAdornmentPadding = 'pr-9',
    inputMode,
    autoComplete = 'off',
    onChange,
    onBlur,
    min,
    max,
}: Props) => {

    const generatedId = useId();
    const inputId = id ?? `${name}-${generatedId}`;
    const messageId = `${inputId}-message`;
    const message = error || success || hint;

    return (
        <div className="flex flex-col gap-1.5 my-2">
            <LabelComponent name={name} htmlFor={inputId} label={label} required={required} />
            <div className={`relative ${fieldClassName || ''}`}>
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    className={`
                        w-full border rounded-lg px-3 py-2 text-sm
                        transition-colors duration-150
                        focus:outline-none focus:ring-2
                        ${error
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/50 dark:bg-red-950/20'
                            : success
                                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/15 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : 'border-[var(--border-strong)] focus:border-primary focus:ring-primary/15 bg-[var(--background)]'
                        }
                        read-only:bg-gray-100 read-only:text-gray-500 read-only:focus:ring-0 dark:read-only:bg-slate-900 dark:read-only:text-gray-400
                        dark:text-gray-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${endAdornment ? endAdornmentPadding : ''}
                        ${className || ''}
                    `}
                    value={value}
                    maxLength={maxLength}
                    required={required}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    autoFocus={autoFocus}
                    inputMode={inputMode}
                    min={min}
                    max={max}
                    aria-required={required ? 'true' : 'false'}
                    aria-disabled={disabled ? 'true' : 'false'}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={message ? messageId : undefined}
                    autoComplete={autoComplete}
                />
                {endAdornment && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {endAdornment}
                    </span>
                )}
            </div>
            {(message || (showCount && maxLength)) && (
                <div className="flex justify-between gap-2 text-xs mt-0.5">
                    <p
                        id={messageId}
                        className={error ? 'text-red-500' : success ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}
                        aria-live={error || success ? 'polite' : undefined}
                    >
                        {message}
                    </p>
                    {showCount && maxLength && (
                        <span className="shrink-0 tabular-nums text-gray-400" aria-hidden="true">
                            {value.length}/{maxLength}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
