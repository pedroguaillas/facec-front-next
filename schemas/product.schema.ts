import { z } from 'zod';

export const productSchema = z.object({
  id: z.string(), // o number si usas timestamp
  code: z.string().min(1, "Codigo requerido").max(25, "Máximo 25 caracteres"),
  aux_cod: z.string().optional(),
  type_product: z.number(),
  name: z.string().min(3, "Nombre del producto requerido").max(300, "Máximo 300 caracteres"),
  iva: z.number(),
  ice: z.string().optional(),
  stock: z.number().optional(),
  price1: z
    .union([
      z.string().refine(val => val.trim() !== "", { message: "Precio requerido" }),
      z.number()
    ])
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: "Precio debe ser mayor o igual a 0" }),
})
  .refine(
    (data) => data.iva !== 5 || (data.aux_cod && data.aux_cod.trim() !== ""),
    {
      path: ['aux_cod'],
      message: 'Código auxiliar requerido si el IVA es 5%',
    }
  );