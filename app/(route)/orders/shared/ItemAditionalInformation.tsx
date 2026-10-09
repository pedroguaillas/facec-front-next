import { AditionalInformation } from "@/types/order";
import { IconButton } from "@/components";
import { cellInput, cellInputError, cellInputNormal, tableRow } from "./FormSection";

interface Props {
    index: number;
    aditionalInformation: AditionalInformation;
    error?: Partial<Record<keyof AditionalInformation, string>>;
    updateItem: (index: number, field: "name" | "description", value: string) => void;
    removeItem: (index: number) => void;
}

const inputBase = cellInput;
const inputError = cellInputError;
const inputNormal = cellInputNormal;

export const ItemAditionalInformation = ({ index, aditionalInformation, error, updateItem, removeItem }: Props) => {
    return (
        <tr className={tableRow}>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    value={aditionalInformation.name ?? ''}
                    type="text"
                    className={`${inputBase} ${error?.name ? inputError : inputNormal}`}
                    maxLength={255}
                />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    value={aditionalInformation.description ?? ''}
                    type="text"
                    className={`${inputBase} ${error?.description ? inputError : inputNormal}`}
                    maxLength={300}
                />
            </td>
            <td className='w-1 py-0.5!'>
                <IconButton action="delete" type="button" onClick={() => removeItem(index)} title="Eliminar campo" />
            </td>
        </tr>
    )
}
