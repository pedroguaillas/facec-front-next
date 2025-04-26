interface CustomerProps {
    id: number,
    atts: {
        identication: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    },
}

interface Customer {
    id: string;
    type_identification: 'cédula' | 'ruc';
    identication: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}