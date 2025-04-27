export interface SupplierProps {
    id: number,
    atts: {
        identication: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    },
}