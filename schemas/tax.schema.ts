import { z } from 'zod';

export const taxSchema = z.object({
    id: z.string(), // o number si usas timestamp
    code: z.coerce.number().min(1, "Seleccione el tipo de impuesto"),
    tax_code: z.string().min(1, { message: 'Seleccione una retención' }),
    // base: z.string().min(1, { message: 'Escriba la base' }),

    porcentage: z
        .string()
        .min(1, { message: 'Escriba el %' })             // evita ''
        .refine(val => !isNaN(Number(val)), { message: 'Debe ser un número válido' }) // evita letras
        .transform(val => Number(val))
        .refine(val => val >= 0, { message: 'El % no puede ser negativo' }), // >= 0

    base: z
        .string()
        .min(1, { message: 'Escriba la base' })         // evita ''
        .refine(val => !isNaN(Number(val)), { message: 'Debe ser un número válido' }) // evita letras
        .transform(val => Number(val))
        .refine(val => val >= 0, { message: 'La base no puede ser negativa' }), // >= 0

});