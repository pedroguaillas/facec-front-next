import { z } from "zod";
import { productOutputSchema } from "./product-output.schema";

export const referralGuideSchema = z
    .object({
        serie: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, {
            message: 'Seleccione el punto de emisión',
        }),
        date_start: z.string().min(1, { message: 'Escriba una fecha correcta' }),
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
        products:z.array(productOutputSchema).min(1, { message: 'Debe agregar al menos un producto' }),
    });