interface CustomerPaginate {
    id: number,
    atts: {
        identication: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    },
}