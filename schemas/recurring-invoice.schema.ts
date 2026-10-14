import { z } from 'zod';
import { productOutputSchema } from './product-output.schema';
import { CONSUMIDOR_FINAL_IDENTICATION, SRI_MAX_LINE_CODE, SRI_MAX_LINE_DESCRIPTION } from '@/constants';
import { filledLength } from '@/helpers/recurrenceHelper';

const monthMessage = (max: number) => `Con el mes reemplazado supera los ${max} caracteres que acepta el SRI`;

// Línea de la plantilla: código y descripción propios opcionales, vacío = los del producto
const recurringLineSchema = productOutputSchema.extend({
    custom_code: z.string().trim().max(40, 'Máximo 40 caracteres').optional()
        .refine(val => !val || filledLength(val) <= SRI_MAX_LINE_CODE, monthMessage(SRI_MAX_LINE_CODE)),
    custom_description: z.string().trim().max(300, 'Máximo 300 caracteres').optional()
        .refine(val => !val || filledLength(val) <= SRI_MAX_LINE_DESCRIPTION, monthMessage(SRI_MAX_LINE_DESCRIPTION)),
});

const optionalInt = (min: number, message: string) => z
    .union([z.literal(''), z.coerce.number().int(message).min(min, message)])
    .transform(val => (val === '' ? null : val));

export const recurringInvoiceSchema = z
    .object({
        name: z.string().trim().min(1, 'Ponle un nombre (ej. Mensualidad internet)').max(100, 'Máximo 100 caracteres'),
        customer_id: z.coerce.number().min(1, 'Seleccione un cliente'),
        customer_identication: z.string().optional(),
        emision_point_id: z.coerce.number({ invalid_type_error: 'Seleccione el punto de emisión' }).min(1, 'Seleccione el punto de emisión'),
        frequency: z.enum(['SEMANAL', 'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL']),
        // datetime-local → "Y-m-d H:i" del backend
        start_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Fecha y hora requeridas').transform(val => val.slice(0, 16).replace('T', ' ')),
        end_date: z.string().transform(val => val || null),
        max_occurrences: optionalInt(1, 'Desde 1 factura'),
        auto_send: z.boolean(),
        payment_type: z.enum(['CONTADO', 'CREDITO']),
        due_days: optionalInt(0, 'Entre 0 y 365 días').refine(val => val === null || val <= 365, 'Entre 0 y 365 días'),
        pay_method: z.coerce.number(),
        source_type: z.string().transform(val => val || null),
        source_id: z.union([z.literal(''), z.number()]).transform(val => (val === '' ? null : val)),
        description: z.string().trim().max(300, 'Máximo 300 caracteres').transform(val => val || null),
        products: z.array(recurringLineSchema).min(1, 'Agrega al menos un producto'),
        aditionals: z.array(z.object({
            id: z.string(),
            name: z.string().trim().min(1, 'Campo requerido').max(50, 'Máximo 50 caracteres'),
            description: z.string().trim().min(1, 'Campo requerido').max(300, 'Máximo 300 caracteres'),
        })).max(10, 'Hasta 10 campos'),
        // Plan financiero: el contado debe ir a una caja o banco
        requires_source: z.boolean(),
    })
    .refine(data => data.customer_identication !== CONSUMIDOR_FINAL_IDENTICATION, {
        path: ['customer_id'],
        message: 'Una factura recurrente no puede ser a consumidor final',
    })
    .refine(data => !data.end_date || data.end_date >= data.start_at.slice(0, 10), {
        path: ['end_date'],
        message: 'Debe ser igual o posterior al inicio',
    })
    .refine(data => data.payment_type !== 'CREDITO' || data.due_days !== null, {
        path: ['due_days'],
        message: 'Indica los días de plazo',
    })
    .refine(data => !data.requires_source || data.payment_type !== 'CONTADO' || (!!data.source_type && !!data.source_id), {
        path: ['source_id'],
        message: 'Seleccione la cuenta bancaria o caja',
    })
    .refine(data => data.products.every(p => p.quantity > 0), {
        path: ['products'],
        message: 'La cantidad debe ser mayor a 0',
    });
