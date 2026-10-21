export const getDate = () => {
    return new Date().toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
}


export const getMinDate = () => {
    const minDate = new Date();
    minDate.setHours(minDate.getUTCDay() - (6 * 24));
    return minDate.toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
}

export const addDaysToDate = (date: string, days: number) => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

// "2026-09-30" → "30/09/2026" (formato del SRI); tolera fecha con hora
export const formatDate = (date?: string | null) => {
    if (!date) return '';
    // Algunos listados del backend ya vienen en d-m-Y (ej. guías)
    if (/^\d{2}-\d{2}-\d{4}/.test(date)) return date.slice(0, 10).replaceAll('-', '/');
    const [year, month, day] = date.slice(0, 10).split('-');
    return day && month && year ? `${day}/${month}/${year}` : date;
}
