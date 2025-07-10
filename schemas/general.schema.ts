export const emptyStringToNull = (val: unknown) => {
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
};

export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // mes inicia en 0
}