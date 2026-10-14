import { RecurringFrequency } from "@/types";

// Meses que avanza cada período (SEMANAL avanza 7 días)
const MONTHS_BY_FREQUENCY: Record<Exclude<RecurringFrequency, 'SEMANAL'>, number> = {
    MENSUAL: 1,
    BIMESTRAL: 2,
    TRIMESTRAL: 3,
    SEMESTRAL: 6,
    ANUAL: 12,
};

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Fecha del período k contando desde el ancla. El día se ajusta al fin de mes (31 → 28 feb), sin arrastrar
export const periodDate = (start: string, frequency: RecurringFrequency, k: number) => {
    const [y, m, d] = start.split('-').map(Number);
    if (frequency === 'SEMANAL') {
        const date = new Date(Date.UTC(y, m - 1, d + 7 * k));
        return toIso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }
    const total = (m - 1) + MONTHS_BY_FREQUENCY[frequency] * k;
    const year = y + Math.floor(total / 12);
    const month = total % 12;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return toIso(year, month, Math.min(d, lastDay));
};

interface Options {
    from: string;
    count: number;
    endDate?: string | null;
    // Emisiones que quedan (max_occurrences - ya emitidas); null = sin límite
    remaining?: number | null;
}

// Próximas emisiones "YYYY-MM-DD HH:mm" desde el inicio de `from` (hoy): cada período mantiene la hora del inicio.
// Si hoy ya pasó la hora, igual cuenta (el backend la emite en el siguiente minuto)
export const upcomingRunDates = (startAt: string, frequency: RecurringFrequency, { from, count, endDate, remaining }: Options) => {
    const match = startAt.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    if (!match) return [];
    const [, start, time] = match;
    const limit = Math.min(count, remaining ?? count);
    const dates: string[] = [];
    // Tope de seguridad: 10 años de semanas
    for (let k = 0; dates.length < limit && k < 600; k++) {
        const date = periodDate(start, frequency, k);
        if (endDate && date > endDate) break;
        if (date >= from) dates.push(`${date} ${time}`);
    }
    return dates;
};

// "5 nov 2026 · 08:30"
export const shortDateTime = (value: string) => {
    const time = value.match(/[T ](\d{2}:\d{2})/)?.[1];
    return time ? `${shortDate(value)} · ${time}` : shortDate(value);
};

// "5 nov 2026"
export const shortDate = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
};

// Reemplaza {mes} {mm} {año} {periodo} {fecha} igual que el backend, para la vista previa
export const fillPlaceholders = (text: string, iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return text
        .replaceAll('{mes}', MONTHS[m - 1])
        .replaceAll('{mm}', pad(m))
        .replaceAll('{año}', String(y))
        .replaceAll('{periodo}', `${MONTHS[m - 1]} ${y}`)
        .replaceAll('{fecha}', `${pad(d)}/${pad(m)}/${y}`);
};

// Largo final en el peor caso (septiembre, el mes más largo), como valida el backend contra el SRI
export const filledLength = (text: string) => fillPlaceholders(text, '2026-09-09').length;

export const hasPlaceholders = (text: string) => /\{(mes|mm|año|periodo|fecha)\}/.test(text);
