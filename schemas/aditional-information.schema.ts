import { z } from 'zod';

export const aditionalInformationSchema = z.object({
    id: z.string(), // o number si usas timestamp
    name: z.string()
        .min(1, { message: 'Campo requerido' })
        .max(255, { message: 'Máximo 255 caracteres' }),
    description: z.string()
        .min(1, { message: 'Campo requerido' })
        .max(300, { message: 'Máximo 300 caracteres' }),
});