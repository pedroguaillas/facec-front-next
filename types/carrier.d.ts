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