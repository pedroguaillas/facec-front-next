import { z } from 'zod';

export const productOutputSchema = z.object({
  id: z.string(), // o number si usas timestamp
  product_id: z.coerce.number().min(1, "Seleccione un producto"),

  quantity: z
    .union([
      z.string().refine(val => val.trim() !== "", { message: "Cantidad requerida" }),
      z.number()
    ])
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: "Cantidad debe ser mayor o igual a 0" }),

  price: z
    .union([
      z.string().refine(val => val.trim() !== "", { message: "Precio requerido" }),
      z.number()
    ])
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: "Precio debe ser mayor o igual a 0" }),

  discount: z
    .union([
      z.string().refine(val => val.trim() !== "", { message: "Descuento requerido" }),
      z.number()
    ])
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: "Descuento inválido" }),

  total_iva: z
    .union([
      z.string().refine(val => val.trim() !== "", { message: "Subtotal requerido" }),
      z.number()
    ])
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: "Subtotal inválido" }),

    // TODO: validar que el ICE si diferente de undefined entocnes tenga un valor mayor a 0
  ice: z.coerce.number().optional(),
  iva: z.number().optional(),
  stock: z.number().optional(),
  percentage: z.number().optional(),
});