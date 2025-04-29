import { aditionalInformationSchema } from './aditional-information.schema';
import { productOutputSchema } from './product-output.schema';
import { z } from 'zod';

export const invoiceSchema = z
  .object({
    date: z.string().min(1, { message: 'Escriba una fecha correcta' }),
    customer_id: z.number().min(1, { message: 'Seleccione el cliente' }),
    serie: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, {
      message: 'Seleccione el punto de emisión',
    }),
    voucher_type: z.coerce.number(), // 1 = Factura, 4 = Nota de crédito
    total: z.number(),
    discount: z.union([
      z.string().refine(val => val.trim() !== "", { message: "Descuento requerida" }),
      z.number()
    ])
      .transform(val => Number(val))
      .refine(val => val >= 0, { message: "Descuento debe ser mayor o igual a 0" }),
    pay_method: z.number(),
    guia: z.string().optional(),
    // Para notas de crédito
    date_order: z.string().optional(),
    serie_order: z.string().optional(),
    rason: z.string().optional(),
    products: z.array(productOutputSchema).min(1, { message: 'Debe agregar al menos un producto' }),
    aditionals: z.array(aditionalInformationSchema).optional(),
  })
  .refine(
    (data) =>
      data.voucher_type !== 1 || // Si no es factura, todo bien
      (data.guia === undefined || data.guia === '' || /^\d{3}-\d{3}-\d{9}$/.test(data.guia)), // Si es factura: opcional, pero válido si existe
    {
      path: ['guia'],
      message: 'Corrija a este formato: 001-001-000000001',
    }
  )
  // 1. Emisión de factura (date_order) obligatoria si es Nota de Crédito
  .refine(
    (data) =>
      data.voucher_type !== 4 || !!data.date_order,
    {
      path: ['date_order'],
      message: 'Es obligatorio la "Emisión factura" para Nota de Crédito',
    }
  )

  // 2. Serie de factura con formato si es Nota de Crédito
  .refine(
    (data) =>
      data.voucher_type !== 4 || (!!data.serie_order && /^\d{3}-\d{3}-\d{9}$/.test(data.serie_order)),
    {
      path: ['serie_order'],
      message: 'Es obligatorio la "Serie factura" con formato: 000-000-000000000',
    }
  )

  // 3. Motivo debe existir y tener al menos 3 caracteres
  .refine(
    (data) =>
      data.voucher_type !== 4 || (!!data.rason && data.rason.length >= 3),
    {
      path: ['rason'],
      message: 'Es obligatorio el "Motivo" y debe contener al menos 3 caracteres',
    }
  )
  .refine(
    // No se puede pagar desde $500 en efectivo
    (data) => !(data.pay_method === 1 && data.total >= 500),
    {
      path: ['pay_method'],
      message: 'Si el total es mayor o igual a 500, debe seleccionar otro forma de pago',
    }
  );
