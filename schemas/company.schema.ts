import { z } from 'zod';
import { emptyStringToNull } from './general.schema';
import { getDate } from '@/helpers/dateHelper';

export const planSchema = z.enum(['GRATUITO', 'FACTURADOR', 'FINANCIERO'], {
    errorMap: () => ({ message: 'Selecciona un plan' }),
});

// Vencimiento: fecha futura, obligatoria salvo GRATUITO (sin fecha = prueba de 1 mes)
export const refinePlanEndsAt = (plan: string, endsAt: string | null | undefined, path: string, ctx: z.RefinementCtx) => {
    if (!endsAt) {
        if (plan !== 'GRATUITO') {
            ctx.addIssue({ path: [path], message: 'La fecha de vencimiento es requerida', code: z.ZodIssueCode.custom });
        }
        return;
    }
    if (endsAt <= getDate()) {
        ctx.addIssue({ path: [path], message: 'La fecha debe ser posterior a hoy', code: z.ZodIssueCode.custom });
    }
};

// Monto pagado: obligatorio salvo GRATUITO
const amountField = z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Monto inválido' }).min(0, 'El monto no puede ser negativo').max(99999999.99, 'Monto demasiado alto').optional(),
);

export const refinePlanAmount = (plan: string, amount: number | undefined, path: string, ctx: z.RefinementCtx) => {
    if (plan !== 'GRATUITO' && amount === undefined) {
        ctx.addIssue({ path: [path], message: 'El monto pagado es requerido', code: z.ZodIssueCode.custom });
    }
};

export const companySchema = z.object({
    ruc: z
        .string()
        .regex(/^\d+$/, 'El RUC debe contener solo números'), // solo dígitos
    company: z
        .string().min(3, "La razon soical requerido")
        .max(300, "Máximo 300 caracteres"),
    user: z
        .string().min(3, "Usuairio requerido")
        .max(20, "Máximo 20 caracteres"),
    password: z
        .string().min(3, "Contraseña requerido")
        .max(50, "Máximo 50 caracteres"),
    email: z
        .string().min(3, "Correo electronico requerido")
        .max(50, "Máximo 50 caracteres"),
    rimpe: z.coerce.number().int().min(0).max(2),
    plan: planSchema,
    plan_ends_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    plan_amount: amountField,
}).superRefine((data, ctx) => {
    if (data.ruc.length !== 13) {
        ctx.addIssue({
            path: ['ruc'],
            message: 'El RUC debe tener exactamente 13 dígitos',
            code: z.ZodIssueCode.custom,
        });
    }
    refinePlanEndsAt(data.plan, data.plan_ends_at, 'plan_ends_at', ctx);
    refinePlanAmount(data.plan, data.plan_amount, 'plan_amount', ctx);
});

// Cambiar / renovar: solo planes pagos (el gratuito es la prueba inicial)
export const subscriptionSchema = z.object({
    plan: z.enum(['FACTURADOR', 'FINANCIERO'], {
        errorMap: () => ({ message: 'Selecciona Facturador o Financiero' }),
    }),
    ends_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    amount: amountField,
}).superRefine((data, ctx) => {
    refinePlanEndsAt(data.plan, data.ends_at, 'ends_at', ctx);
    refinePlanAmount(data.plan, data.amount, 'amount', ctx);
});
