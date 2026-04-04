interface Props {
    required?: boolean;
    label: string;
    name: string;
}

export const LabelComponent = ({ required, label, name }: Props) => {
    return (
        <label htmlFor={name} className="text-sm font-medium dark:text-gray-300">
            {label}
            {required && <span className="text-red-500"> *</span>} {/* Indicador visual de requerido */}
        </label>
    )
}
