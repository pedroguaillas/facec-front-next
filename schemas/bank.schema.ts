import { z } from 'zod';

export const bankSchema = z.object({
    name: z.string()
        .min(3, 'Nombre del banco requerido')
        .max(150, 'Máximo 150 caracteres'),
});
