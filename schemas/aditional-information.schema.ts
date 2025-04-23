import { z } from 'zod';

export const aditionalInformationSchema = z.object({
    id: z.string(), // o number si usas timestamp
    name: z.string().min(1, { message: 'Campo requerido' }),
    description: z.string().min(1, { message: 'Campo requerido' }),
});