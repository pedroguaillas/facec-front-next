import { z } from 'zod';

const repaymentTaxSchema = z.object({
  iva_tax_code: z.number(),
  base: z.number(),
  iva: z.number(),
});

export const repaymentSchema = z.object({
  // id: z.string(), // o number si usas timestamp
  identification: z
    .string()
    .min(10, { message: 'Mínimo 10 dígitos' })
    .regex(/^\d+$/, 'La identificación debe contener solo números'),

  sequential: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, {
    message: 'Corrija a este formato: 001-001-000000001',
  }),

  date: z.string().min(5, { message: 'Escriba una fecha correcta' }),

  authorization: z
    .string()
    .regex(/^\d+$/, 'La autorización debe contener solo números')
    .refine(
      (val) => val.length === 10 || val.length === 49,
      { message: 'La autorización debe tener 10 o 49 dígitos' }
    ),

  repaymentTaxes: z.array(repaymentTaxSchema).superRefine((taxes, ctx) => {
    const seenCodes = new Set<number>();

    taxes.forEach((tax, index) => {
      if (seenCodes.has(tax.iva_tax_code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El código de IVA ${tax.iva_tax_code} está duplicado`,
          path: [index, 'iva_tax_code'],
        });
      }
      seenCodes.add(tax.iva_tax_code);
    });
  }),
});