import { RecurringFrequency, RecurringStatus } from "@/types";

export const recurringFrequencyLabels: Record<RecurringFrequency, string> = {
    SEMANAL: 'Semanal',
    MENSUAL: 'Mensual',
    BIMESTRAL: 'Cada 2 meses',
    TRIMESTRAL: 'Cada 3 meses',
    SEMESTRAL: 'Cada 6 meses',
    ANUAL: 'Anual',
};

export const recurringFrequencyOptions = (Object.keys(recurringFrequencyLabels) as RecurringFrequency[])
    .map(value => ({ value, label: recurringFrequencyLabels[value] }));

export const recurringStatusLabels: Record<RecurringStatus, string> = {
    ACTIVA: 'Activa',
    PAUSADA: 'Pausada',
    FINALIZADA: 'Finalizada',
};

// Marcadores que el backend reemplaza según la fecha del período
export const RECURRING_PLACEHOLDERS = ['{mes}', '{mm}', '{año}', '{periodo}', '{fecha}'] as const;

// Límites del SRI una vez reemplazado el mes
export const SRI_MAX_LINE_CODE = 25;
export const SRI_MAX_LINE_DESCRIPTION = 300;

export const MAX_RECURRING_ADITIONALS = 10;

// Tarifa (%) por código de IVA del SRI, para recalcular totales de items guardados
export const IVA_PERCENTAGE_BY_CODE: Record<number, number> = { 0: 0, 2: 12, 3: 14, 4: 15, 5: 5, 6: 0, 7: 0, 8: 8 };
