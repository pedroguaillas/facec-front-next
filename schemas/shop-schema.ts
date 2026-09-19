import { z } from 'zod';
import { taxSchema } from './tax.schema';
import { productOutputSchema } from './product-output.schema';
import { SHOP_VOUCHER_TYPE_ID } from '@/constants';
import { emptyStringToNull, parseLocalDate } from './general.schema';

export const shopSchema = z
  .object({
    date: z.string().min(1, { message: 'Escriba una fecha correcta' }),
    provider_id: z.number().min(1, { message: 'Seleccione el proveedor' }),
    // Liquidación de Compra: el número lo asigna el backend al guardar (va
    // null, validado abajo). El resto lo tipea el usuario copiándolo del
    // documento del proveedor, por eso sigue siendo obligatorio.
    serie: z.string().nullable(),
    voucher_type_id: z.coerce.number(), // ids vienen de voucherTypes (backend): 5 Factura, 6 Nota de Venta, 7 Liquidación de Compra, 8 Nota de Débito
    authorization: z.string().optional(),
    serie_retencion: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    date_retention: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
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
    // Factura, Nota de Venta y Nota de Débito requieren la serie tipeada por
    // el usuario (documento externo); Liquidación va null (la asigna el backend).
    if (data.voucher_type_id === SHOP_VOUCHER_TYPE_ID.LIQUIDACION_COMPRA) return true;
    return !!data.serie && /^\d{3}-\d{3}-\d{9}$/.test(data.serie);
  }, {
    message: 'Corrija a este formato: 001-001-000000001',
    path: ['serie'],
  })
  .refine((data) => {
    // ✅ Solo requerido si es Liquidación de Compra
    if (data.voucher_type_id === SHOP_VOUCHER_TYPE_ID.LIQUIDACION_COMPRA) {
      return data.products && data.products.length > 0;
    }
    return true;
  }, {
    message: 'Agregue al menos un producto',
    path: ['products'],
  })
  .refine((data) => {
    // Si NO es liquidación, authorization es requerida y mínima de 10 caracteres
    if (data.voucher_type_id !== SHOP_VOUCHER_TYPE_ID.LIQUIDACION_COMPRA) {
      return data.authorization && data.authorization.length >= 10;
    }
    return true;
  }, {
    message: 'Ingrese un número de autorización válido',
    path: ['authorization'],
  })
  .refine((data) => {
    // ✅ Si existen taxes, debe existir serie_retencion
    if (data.taxes && data.taxes.length > 0) {
      return !!data.serie_retencion;
    }
    return true;
  }, {
    message: 'Seleccione un punto de emisión',
    path: ['serie_retencion'],
  })
  .refine((data) => {
    if (data.taxes && data.taxes.length > 0) {
      if (!data.date_retention) return false;

      try {
        const retentionDate = parseLocalDate(data.date_retention);
        const mainDate = parseLocalDate(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return retentionDate >= mainDate && retentionDate <= today;
      } catch {
        return false;
      }
    }

    return true;
  }, {
    message: 'La fecha de retención debe ser mayor o igual a la fecha del comprobante y no puede ser mayor a hoy.',
    path: ['date_retention'],
  });
