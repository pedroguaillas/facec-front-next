export interface CarrierProps {
    id: number,
    atts: {
        identication: string;
        name: string;
        address?: string;
        license_plate: string;
        phone?: string;
        email?: string;
    },
}

interface Carrier {
    id: string,
    type_identification: 'cédula' | 'ruc';
    identication: string;
    name: string;
    address?: string;
    license_plate: string;
    phone?: string;
    email?: string;
    branch_id?: number; // Utilizo para recuperar un carrier del SRI o base de datos
}