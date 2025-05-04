export interface ProductProps {
    id: number,
    atts: {
        code: string,
        type_product: number,
        name: string,
        price1: number,
        iva: number,
        ice: null,
        irbpnr: null,
        stock: null,
        tourism: false,
    },
    iva: {
        code: number,
        percentage: number,
    },
}

interface Product {
    id: string,
    code: string,
    aux_cod?: string,
    type_product: number,
    name: string,
    unity_id?: number,
    iva: number,
    ice?: string,
    stock?: number,
    price1: string | number,
}