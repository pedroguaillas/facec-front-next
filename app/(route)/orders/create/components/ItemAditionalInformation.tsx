import { FaTrash } from "react-icons/fa";

interface Props {
    index: number;
    aditionalInformation: AditionalInformation;
    updateItem: (index: number, field: "name" | "description", value: string) => void;
    removeItem: (index: number) => void;
}

export const ItemAditionalInformation = ({ index, aditionalInformation, updateItem, removeItem }: Props) => {
    return (
        <tr className="[&>th]:p-2">
            <td className="border border-gray-300">
                <input
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    value={aditionalInformation.name ?? ''}
                    type="text"
                    className="w-full dark:text-white"
                />
            </td>
            <td className="border border-gray-300">
                <input
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    value={aditionalInformation.description ?? ''}
                    type="text"
                    className="w-full dark:text-white"
                />
            </td>
            <td className='border border-gray-300'>
                <button onClick={() => removeItem(index)} className="flex justify-end items-center text-red-500 cursor-pointer">
                    <FaTrash />
                </button>
            </td>
        </tr>
    )
}
