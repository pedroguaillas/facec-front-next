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