import { Tax } from "@/types"

interface Props {
    tax: Tax;
}

export const ItemTax = ({ tax }: Props) => {
    return (
        <tr>
            <td>{tax.code} </td>
            <td>{tax.tax_code}</td>
            <td>{tax.porcentage}</td>
            <td>{tax.base}</td>
            <td>{tax.value}</td>
            <td></td>
        </tr>
    )
}
