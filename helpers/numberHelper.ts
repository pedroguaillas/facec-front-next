// Trunca decimales sin redondear, para no alterar lo que el usuario tipeó.
export const limitDecimals = (raw: string, max: number) => {
    const [whole, decimals] = raw.split('.');
    if (decimals && decimals.length > max) {
        return `${whole}.${decimals.slice(0, max)}`;
    }
    return raw;
};
