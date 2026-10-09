interface Props {
    required?: boolean;
    label: string;
    name: string;
    // id del control asociado; si no se envía se usa `name`
    htmlFor?: string;
}

export const LabelComponent = ({ required, label, name, htmlFor }: Props) => {
    return (
        <label htmlFor={htmlFor ?? name} className="text-sm font-medium dark:text-gray-300">
            {label}
            {required && <span className="text-red-500" aria-hidden="true"> *</span>} {/* Indicador visual de requerido */}
        </label>
    )
}
