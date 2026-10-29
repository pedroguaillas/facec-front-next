import { ProductCharacteristic, ProductTemplate, ProductTemplateField, ProductTemplateFieldLevel } from "@/types";

// Campos activos de un nivel, en el orden de la plantilla
export const templateFieldsOf = (template: ProductTemplate | undefined, level: ProductTemplateFieldLevel): ProductTemplateField[] =>
    (template?.fields ?? []).filter(f => f.active && f.level === level).sort((a, b) => a.sort - b.sort);

// Igual que el backend: obligatorio, número válido, año de 4 dígitos, máx 300
export const validateTemplateDetails = (fields: ProductTemplateField[], details: Record<string, string>) => {
    const errors: Record<string, string> = {};
    fields.forEach(field => {
        const value = (details[field.key] ?? '').trim();
        if (!value) {
            if (field.required) errors[field.key] = `${field.label} es obligatorio`;
            return;
        }
        if (value.length > 300) errors[field.key] = 'Máximo 300 caracteres';
        else if (field.type === 'number' && !Number.isFinite(Number(value))) errors[field.key] = 'Número inválido';
        else if (field.type === 'year' && !/^\d{4}$/.test(value)) errors[field.key] = 'Año de 4 dígitos';
    });
    return errors;
};

// Solo las keys de los campos dados, sin espacios sobrantes
export const pickTemplateDetails = (fields: ProductTemplateField[], details: Record<string, string> = {}) =>
    Object.fromEntries(fields.map(field => [field.key, (details[field.key] ?? '').trim()]));

// Código que arma el backend: prefijo + valor del campo de código (M + 5452 → M5452)
export const unitCodeOf = (template: ProductTemplate | undefined, details: Record<string, string>) => {
    const codeField = template?.fields.find(f => f.id === template.code_field_id);
    if (!codeField) return null;
    const value = (details[codeField.key] ?? '').trim();
    return value ? `${template?.code_prefix ?? ''}${value}` : '';
};

// Plantilla con campos por unidad: el modelo no se vende/compra directo, va por unidad
export const requiresUnit = (template: ProductTemplate | undefined) => templateFieldsOf(template, 'unidad').length > 0;

// "Chasis 5452 · Motor 45262" en el orden de la plantilla, sin valores vacíos
export const characteristicsText = (characteristics?: ProductCharacteristic[] | null) =>
    [...(characteristics ?? [])].sort((a, b) => a.sort - b.sort).filter(c => c.value).map(c => `${c.label} ${c.value}`).join(' · ');

// Una unidad (ej. una moto) se vende o despacha en su propia línea con cantidad 1
export const isUnitLine = (item: { parent_product_id?: number | null }) => !!item.parent_product_id;
