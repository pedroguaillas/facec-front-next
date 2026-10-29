import { z } from 'zod';

// Máximo de características que van al <detAdicional> del SRI
export const MAX_SRI_TEMPLATE_FIELDS = 3;

const fieldSchema = z.object({
    id: z.number().optional(),
    key: z.string().regex(/^[a-z0-9_]+$/, 'Nombre inválido: usa letras y números'),
    label: z.string().trim().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
    type: z.enum(['text', 'number', 'year']),
    level: z.enum(['modelo', 'unidad']),
    required: z.boolean(),
    unique: z.boolean(),
    in_sri: z.boolean(),
    sort: z.number(),
    active: z.boolean(),
});

export const productTemplateSchema = z.object({
    name: z.string().trim().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
    code_prefix: z.string().max(5, 'Máximo 5 caracteres').regex(/^[A-Za-z0-9]*$/, 'Solo letras y números').nullable(),
    code_field_key: z.string().nullable(),
    active: z.boolean(),
    fields: z.array(fieldSchema).min(1, 'Agrega al menos una característica'),
})
    .superRefine((data, ctx) => {
        if (data.fields.filter(f => f.active && f.in_sri).length > MAX_SRI_TEMPLATE_FIELDS) {
            ctx.addIssue({ code: 'custom', path: ['fields'], message: `Solo ${MAX_SRI_TEMPLATE_FIELDS} características pueden ir en la información adicional del SRI.` });
        }
        data.fields.forEach((field, index) => {
            if (field.key && data.fields.findIndex(f => f.key === field.key) !== index) {
                ctx.addIssue({ code: 'custom', path: ['fields', index, 'label'], message: 'Característica repetida' });
            }
        });
        const codeField = data.fields.find(f => f.key === data.code_field_key);
        if (data.code_field_key && (!codeField || codeField.level !== 'unidad' || !codeField.unique || !codeField.active)) {
            ctx.addIssue({ code: 'custom', path: ['code_field_key'], message: 'El campo del código debe ser de unidad, único y activo' });
        }
    });
