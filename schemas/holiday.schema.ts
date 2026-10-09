import { z } from 'zod';

export const holidaySchema = z.object({
    name: z.string().trim().min(3, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    starts_at: z.string().min(1, 'La fecha de inicio es requerida'),
    ends_at: z.string().min(1, 'La fecha de fin es requerida'),
}).refine(data => !data.starts_at || !data.ends_at || data.ends_at >= data.starts_at, {
    path: ['ends_at'],
    message: 'Debe ser igual o posterior a la fecha de inicio',
});
