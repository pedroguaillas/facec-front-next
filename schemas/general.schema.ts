export const emptyStringToNull = (val: unknown) => {
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
};