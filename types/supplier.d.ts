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

interface Supplier {
    id: string,
    type_identification: 'cédula' | 'ruc';
    identication: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}