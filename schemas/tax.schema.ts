import { z } from 'zod';

export const taxSchema = z.object({
    id: z.string(), // o number si usas timestamp
    code: z.coerce.number().min(1, "Seleccione el tipo de impuesto"),
    tax_code: z.string().min(1, { message: 'Seleccione una retención' }),

    porcentage: z
        .union([
            z.string().refine(val => val.trim() !== "", { message: "Porcentaje requerida" }),
            z.number()
        ])
        .transform(val => Number(val))
        .refine(val => val >= 0, { message: "Cantidad debe ser mayor o igual a 0" }),

    base: z
        .union([
            z.string().refine(val => val.trim() !== "", { message: "Cantidad requerida" }),
            z.number()
        ])
        .transform(val => Number(val))
        .refine(val => val >= 0, { message: "Cantidad debe ser mayor o igual a 0" }),
});