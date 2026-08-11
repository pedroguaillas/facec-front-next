import { LabelComponent } from '../label/LabelComponent';

interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'month';
    value: string;
    required?: boolean;
    label: string;
    name: string;
    maxLength?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    error?: string;
    success?: string;
    min?: string;
    max?: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextInput = ({
    type = 'text',
    value,
    required,
    label,
    name,
    maxLength,
    placeholder,
    disabled,
    className,
    error,
    success,
    onChange,
    min,
    max,
}: Props) => {
    return (
        <div className="flex flex-col gap-1.5 my-2">
            <LabelComponent name={name} label={label} required={required} />
            <input
                type={type}
                name={name}
                className={`
                    border rounded-lg px-3 py-2 text-sm
                    transition-colors duration-150
                    focus:outline-none
                    ${error
                        ? 'border-red-400 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20'
                        : success
                            ? 'border-emerald-400 focus:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-[var(--border-strong)] focus:border-primary bg-[var(--background)]'
                    }
                    dark:text-gray-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${className || ''}
                `}
                value={value}
                maxLength={maxLength}
                required={required}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                aria-required={required ? 'true' : 'false'}
                aria-disabled={disabled ? 'true' : 'false'}
                autoComplete='off'
            />
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
            {!error && success && <p className="text-xs text-emerald-600 mt-0.5">{success}</p>}
        </div>
    );
};
