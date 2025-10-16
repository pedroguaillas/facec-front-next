import { AditionalInformation } from "@/types/order";
import { FaTrash } from "react-icons/fa";

interface Props {
    index: number;
    aditionalInformation: AditionalInformation;
    error?: Partial<Record<keyof AditionalInformation, string>>;
    updateItem: (index: number, field: "name" | "description", value: string) => void;
    removeItem: (index: number) => void;
}

export const ItemAditionalInformation = ({ index, aditionalInformation, error, updateItem, removeItem }: Props) => {
    return (
        <tr className="[&>th]:p-2">
            <td className="border border-gray-300">
                <input
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    value={aditionalInformation.name ?? ''}
                    type="text"
                    className={`w-full border px-1 rounded text-gray-600 dark:text-gray-300
                        ${error?.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    maxLength={255}
                />
            </td>
            <td className="border border-gray-300">
                <input
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    value={aditionalInformation.description ?? ''}
                    type="text"
                    className={`w-full border px-1 rounded text-gray-600 dark:text-gray-300
                        ${error?.description ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    maxLength={300}
                />
            </td>
            <td className='border border-gray-300 w-1'>
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
