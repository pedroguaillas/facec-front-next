export const getDate = () => {
    return new Date().toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
}


export const getMinDate = () => {
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 3);
    return minDate.toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
}