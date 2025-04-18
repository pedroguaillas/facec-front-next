import {z} from 'zod';

export const invoiceSchema = z.object({
//   serie: 'Cree un punto de emisión',
  date: z.string().min(1, {message: 'Escriba una fecha correceta'}),
  customer_id: z.number().min(1, {message: 'Seleccione el cliente'}),
//   doc_realeted: 0,
//   voucher_type: 1,
//   pay_method: 20,
  guia: z.string().optional(),
});