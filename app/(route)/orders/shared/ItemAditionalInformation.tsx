import { AditionalInformation } from "@/types/order";
import { FaTrash } from "react-icons/fa";

interface Props {
    index: number;
    aditionalInformation: AditionalInformation;
    error?: Partial<Record<keyof AditionalInformation, string>>;
    updateItem: (index: number, field: "name" | "description", value: string) => void;
    removeItem: (index: number) => void;
}

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const inputError = "border-red-400";
const inputNormal = "border-[var(--border-strong)]";

export const ItemAditionalInformation = ({ index, aditionalInformation, error, updateItem, removeItem }: Props) => {
    return (
        <tr className="[&>th]:p-2">
            <td className="border border-[var(--border)] p-1.5">
                <input
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    value={aditionalInformation.name ?? ''}
                    type="text"
                    className={`${inputBase} ${error?.name ? inputError : inputNormal}`}
                    maxLength={255}
                />
            </td>
            <td className="border border-[var(--border)] p-1.5">
                <input
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    value={aditionalInformation.description ?? ''}
                    type="text"
                    className={`${inputBase} ${error?.description ? inputError : inputNormal}`}
                    maxLength={300}
                />
            </td>
            <td className='border border-[var(--border)] w-1 p-1.5'>
                <button
                    onClick={() => removeItem(index)}
                    className="flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600"
                >
                    <FaTrash />
                </button>
            </td>
        </tr>
    )
}
