export const getDate = () => {
    return new Date().toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
}


export const getMinDate = () => {
    const minDate = new Date();
    minDate.setHours(minDate.getUTCDay() - (4 * 24));
    return minDate.toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
}