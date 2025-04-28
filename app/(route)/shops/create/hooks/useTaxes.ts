import { Tax } from "@/types";
import { useCreateShop } from "../context/ShopCreateContext";

export const useTaxes = () => {

    const { taxes, setTaxes } = useCreateShop();

    const updateItem = (index: number, field: keyof Tax, value: string | number) => {
        const newTaxes = [...taxes]; // Copiamos el array
        newTaxes[index] = { ...newTaxes[index], [field]: value }; // Copiamos y actualizamos el objeto
        setTaxes(newTaxes); // Seteamos el nuevo array
    };

    return { updateItem }
}
