import { z } from 'zod';
import { taxSchema } from './tax.schema';

export const shopSchema = z
  .object({
    date: z.string().min(1, { message: 'Escriba una fecha correcta' }),
    provider_id: z.number().min(1, { message: 'Seleccione el proveedor' }),
    serie: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, {
      message: 'Corrija a este formato: 001-001-000000001',
    }),
    voucher_type: z.coerce.number(), // 1 = Factura, 4 = Nota de crédito
    authorization: z.string().min(10, { message: 'Minimo 10 dígitos' }),
    serie_retencion: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, {
      message: 'Seleccione un punto de emisión',
    }),
    date_retention: z.string().min(1, { message: 'Escriba una fecha correcta' }),
    no_iva: z.number(),
    base0: z.number(),
    base5: z.number(),
    base12: z.number(),
    base15: z.number(),
    total: z.number(),
    discount: z.number(),
    taxes: z.array(taxSchema).min(1, { message: 'Debe agregar al menos una retención' }),
  });
