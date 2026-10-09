interface SwitchProps {
    name: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    // Texto de ayuda bajo la etiqueta
    description?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    name,
    label,
    checked,
    onChange,
    disabled = false,
    description,
}) => {
    return (
        <label className={`flex items-start gap-3 py-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <span className="relative mt-0.5 shrink-0">
                <input
                    type="checkbox"
                    role="switch"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <span className="block w-10 h-6 rounded-full bg-line-strong transition-colors duration-150 peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface peer-disabled:opacity-50" />
                <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 peer-checked:translate-x-4" />
            </span>
            <span className="flex flex-col">
                <span className={`text-sm font-medium ${disabled ? 'text-ink-4' : 'text-ink-1'}`}>{label}</span>
                {description && <span className="text-xs text-ink-3 mt-0.5">{description}</span>}
            </span>
        </label>
    );
};
