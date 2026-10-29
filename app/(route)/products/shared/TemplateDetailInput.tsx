import { TextInput } from "@/components";
import { ProductTemplateField } from "@/types";

interface Props {
    field: ProductTemplateField;
    value: string;
    error?: string;
    onChange: (key: string, value: string) => void;
}

// Input de una característica según su tipo (texto, número o año)
export const TemplateDetailInput = ({ field, value, error, onChange }: Props) => (
    <TextInput
        type="text"
        label={field.label}
        name={`details.${field.key}`}
        value={value}
        error={error}
        onChange={(e) => onChange(field.key, field.type === 'year' ? e.target.value.replace(/\D/g, '') : e.target.value)}
        inputMode={field.type === 'number' ? 'decimal' : field.type === 'year' ? 'numeric' : undefined}
        maxLength={field.type === 'year' ? 4 : 300}
        placeholder={field.type === 'year' ? 'Ej. 2026' : undefined}
        required={field.required}
    />
);
