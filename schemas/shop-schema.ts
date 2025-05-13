import { z } from 'zod';
import { taxSchema } from './tax.schema';
import { productOutputSchema } from './product-output.schema';
import { VoucherType } from '@/constants';

export const shopSchema = z
  .object({
    date: z.string().min(1, { message: 'Escriba una fecha correcta' }),
    provider_id: z.number().min(1, { message: 'Seleccione el proveedor' }),
    serie: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, {
      message: 'Corrija a este formato: 001-001-000000001',
    }),
    voucher_type: z.coerce.number(), // 1 = Factura, 4 = Nota de crédito
    authorization: z.string().optional(),
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
    products: z.array(productOutputSchema).optional(),
    taxes: z.array(taxSchema).optional(),
  })
  .refine((data) => {
    // ✅ Solo requerido si es LIQUIDATION
    if (data.voucher_type === VoucherType.LIQUIDATION) {
      return data.products && data.products.length > 0;
    }
    return true;
  }, {
    message: 'Agregue al menos un producto',
    path: ['products'],
  })
  .refine((data) => {
    // Si NO es liquidación, authorization es requerida y mínima de 10 caracteres
    if (data.voucher_type !== VoucherType.LIQUIDATION) {
      return data.authorization && data.authorization.length >= 10;
    }
    return true;
  }, {
    message: 'Ingrese un número de autorización válido',
    path: ['authorization'],
  });
