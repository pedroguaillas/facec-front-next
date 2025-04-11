interface ProductPaginate {
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