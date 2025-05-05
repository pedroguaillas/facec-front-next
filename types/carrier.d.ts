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
    type_identification: string;
    identication: string;
    name: string;
    address?: string;
    license_plate: string;
    phone?: string;
    email?: string;
}