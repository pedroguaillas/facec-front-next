import { z } from 'zod';
import { addDaysToDate, getDate } from '@/helpers/dateHelper';
import { GUIDE_DURATION_MAX_DAYS } from '@/constants/referralGuides';

export const productOutputSchema = z.object({
	id: z.string(), // o number si usas timestamp
	product_id: z.coerce.number().min(1, 'Seleccione un producto'),

	quantity: z
		.union([
			z.string().refine(val => val.trim() !== '', { message: 'Cantidad requerida' }),
			z.number(),
		])
		.transform(val => Number(val))
		.refine(val => val >= 0, { message: 'Cantidad debe ser mayor o igual a 0' }),
});

export const referralGuideSchema = z.object({
	serie: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, {
		message: 'Seleccione el punto de emisión',
	}),
	// Lo fija el backend (fecha de emisión); solo se usa para validar el fin
	date_start: z.string().optional(),
	date_end: z.string().min(1, { message: 'Escriba una fecha correcta' }),
	carrier_id: z.number().min(1, { message: 'Seleccione el transportista' }),
	customer_id: z.number().min(1, { message: 'Seleccione el destinatario o cliente' }),
	address_from: z.string().min(3, { message: 'Escriba la dirección partida' }),
	address_to: z.string().min(3, { message: 'Escriba la dirección destino' }),
	reason_transfer: z.string().min(3, { message: 'Escriba lo que transporta' }),
	branch_destiny: z.string().optional(),
	customs_doc: z.string().optional(),
	route: z.string().optional(),
	serie_invoice: z.string().optional(),
	date_invoice: z.string().optional(),
	authorization_invoice: z.string().optional(),
	products: z.array(productOutputSchema).min(1, { message: 'Debe agregar al menos un producto' }),
}).superRefine((data, ctx) => {
	const start = data.date_start || getDate();
	if (data.date_end < start || data.date_end > addDaysToDate(start, GUIDE_DURATION_MAX_DAYS)) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['date_end'], message: `Desde el inicio hasta ${GUIDE_DURATION_MAX_DAYS} días después` });
	}
});
