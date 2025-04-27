export const getDate = () => {
    return new Date().toLocaleDateString('en-Ca', { timeZone: 'America/Guayaquil' });
}