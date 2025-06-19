export interface Branch {
    id: string,
    store: number,
    address: string,
    name?: null | string,
    type: 'matriz' | 'sucursal',
    cf?: boolean,
}