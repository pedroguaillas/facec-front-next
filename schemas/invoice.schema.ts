import { aditionalInformationSchema } from './aditional-information.schema';
import { productOutputSchema } from './product-output.schema';
import { z } from 'zod';
import { repaymentSchema } from './repayment.schema';
import { TRANSPORT_AUX_COD_PREFIX } from '@/constants';

export const invoiceSchema = z
  .object({
    // date: z.string().min(1, { message: 'Escriba una fecha correcta' }),
    customer_id: z.number().min(1, { message: 'Seleccione el cliente' }),
    // El número de secuencia real lo asigna el backend al guardar, no se genera en el frontend.
    point_id: z.number({ required_error: 'Seleccione el punto de emisión' }).min(1, { message: 'Seleccione el punto de emisión' }),
    voucher_type_id: z.coerce.number(), // ids vienen de voucherTypes (backend): 1 Factura, 2 Nota de Crédito, 3 Nota de Venta, 4 Proforma
    total: z.number(),
    discount: z.union([
      z.string()
        .refine(val => val.trim() !== "", { message: "Descuento requerida" }),
      z.number()
    ])
      .transform(val => Number(val))
      .refine(val => val >= 0, { message: "Descuento debe ser mayor o igual a 0" }),
    pay_method: z.number(),
    payment_type: z.enum(['CONTADO', 'CREDITO', 'ANTICIPO']),
    due_date: z.string().optional(),
    // Plan sin cartera (Facturador): no se elige forma de pago ni origen (caja/banco)
    without_source: z.boolean().optional(),
    source_type: z.enum(['bank_account', 'cash_register_session']).optional(),
    source_id: z.number().optional(),
    guia: z.string().optional(),
    plate: z.string().optional(),
    // Para notas de crédito
    date_order: z.string().optional(),
    serie_order: z.string().optional(),
    reason: z.string().optional(),
    products: z.array(productOutputSchema)
      .min(1, { message: 'Debe agregar al menos un producto' }),
    repayments: z.array(repaymentSchema).optional().superRefine((repayments, ctx) => {
      // ✅ Verificar que repayments existe y tiene elementos
      if (!repayments || repayments.length === 0) {
        return; // Si es undefined o vacío, no validar
      }

      const seenCodes = new Set<string>();

      repayments.forEach((repayment, index) => {
        if (seenCodes.has(repayment.authorization)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La autorización está duplicado`,
            path: [index, 'authorization'],
          });
        }
        seenCodes.add(repayment.authorization);
      });
    }),
    aditionals: z.array(aditionalInformationSchema).optional(),
  })
  .refine(
    (data) =>
      data.voucher_type_id !== 1 || // Si no es factura, todo bien
      (data.guia === undefined || data.guia === '' || /^\d{3}-\d{3}-\d{9}$/.test(data.guia)), // Si es factura: opcional, pero válido si existe
    {
      path: ['guia'],
      message: 'Corrija a este formato: 001-001-000000001',
    }
  )
  // Validación: suma de bases de reembolsos debe ser igual al total
  .refine(
    (data) => {
      // Si no hay reembolsos, no validar
      if (!data.repayments || data.repayments.length === 0) {
        return true;
      }

      // Calcular la suma de todas las bases de los impuestos de reembolsos
      const totalBasesReembolsos = data.repayments.reduce((total, repayment) => {
        const baseRepayment = repayment.repaymentTaxes.reduce((sum, tax) => {
          return sum + tax.base + tax.iva;
        }, 0);
        return total + baseRepayment;
      }, 0);

      // Comparar con el total de la factura (con tolerancia para decimales)
      return Math.abs(totalBasesReembolsos - data.total) < 0.01;
    },
    {
      path: ['repayments'],
      message: 'La suma de las bases de los reembolsos debe ser igual al total de la factura',
    }
  )
  // 1. Emisión de factura (date_order) obligatoria si es Nota de Crédito
  .refine(
    (data) =>
      data.voucher_type_id !== 2 || !!data.date_order,
    {
      path: ['date_order'],
      message: 'Es obligatorio la "Emisión factura" para Nota de Crédito',
    }
  )

  // 2. Serie de factura con formato si es Nota de Crédito
  .refine(
    (data) =>
      data.voucher_type_id !== 2 || (!!data.serie_order && /^\d{3}-\d{3}-\d{9}$/.test(data.serie_order)),
    {
      path: ['serie_order'],
      message: 'Es obligatorio la "Serie factura" con formato: 000-000-000000000',
    }
  )

  // 3. Motivo debe existir y tener al menos 3 caracteres
  .refine(
    (data) =>
      data.voucher_type_id !== 2 || (!!data.reason && data.reason.length >= 3),
    {
      path: ['reason'],
      message: 'Es obligatorio el "Motivo" y debe contener al menos 3 caracteres',
    }
  )
  .refine(
    // No se puede pagar desde $500 en efectivo
    (data) => !(data.pay_method === 1 && data.total >= 500),
    {
      path: ['pay_method'],
      message: 'Monto desde $500, debe seleccionar otro forma de pago',
    }
  )
  // Crédito y Anticipo necesitan due_date (Anticipo: por si no alcanza y el resto queda a crédito)
  .refine(
    (data) => data.payment_type === 'CONTADO' || !!data.due_date,
    {
      path: ['due_date'],
      message: 'Ingrese el plazo',
    }
  )
  // Contado: genera movimiento real en Treasury, requiere origen
  .refine(
    (data) => data.without_source || data.payment_type !== 'CONTADO' || !!data.source_type,
    {
      path: ['source_type'],
      message: 'Seleccione una cuenta bancaria o caja',
    }
  )
  .refine(
    (data) => data.without_source || data.payment_type !== 'CONTADO' || (data.source_id ?? 0) > 0,
    {
      path: ['source_id'],
      message: 'Seleccione una cuenta bancaria o caja',
    }
  )
  // Placa obligatoria si algún item es un servicio de transporte (aux_cod H49200...)
  .refine(
    (data) =>
      !data.products.some((p) => p.aux_cod?.startsWith(TRANSPORT_AUX_COD_PREFIX)) ||
      (!!data.plate && data.plate.trim() !== ''),
    {
      path: ['plate'],
      message: 'La placa es obligatoria para servicios de transporte',
    }
  );
