// Teléfono de Ecuador en formato local: solo dígitos y sin el código de país
// "+593 95 964 9714", "593959649714", "095 964 9714" → "0959649714"
export const normalizePhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    // 593 + al menos 8 dígitos (fijo) es número internacional; con menos aún se está escribiendo
    if (digits.startsWith('593') && digits.length >= 11) {
        const local = digits.slice(3);
        return local.startsWith('0') ? local : `0${local}`;
    }
    return digits;
};
