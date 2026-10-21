import { ProductPresentation, ProductProps } from "@/types";

// Factor de conversión: hasta 6 decimales (ej. 0.083333), sin redondear a menos
export const formatFactor = (factor: number | string) => Number(factor).toLocaleString('es-EC', { maximumFractionDigits: 6 });

// Presentación cuyo código coincide exactamente con lo buscado (ej. se escaneó el código de barras de la cubeta)
export const presentationBySearch = (product: ProductProps, search?: string): ProductPresentation | null => {
    const term = search?.trim().toLowerCase();
    if (!term) return null;
    return product.presentations?.find(p => p.code?.trim().toLowerCase() === term) ?? null;
};
