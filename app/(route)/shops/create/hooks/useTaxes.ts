import { Tax, TaxInput } from "@/types";
import { useCreateShop } from "../context/ShopCreateContext";
import { initialTax } from "@/constants/initialValues";
import { nanoid } from "nanoid";

export const useTaxes = () => {

    const { taxes, setTaxes, setErrorTaxes } = useCreateShop();

    // Agregar producto a la lista
    const addItem = () => {
        setTaxes((prev) => ([...prev, { ...initialTax, id: nanoid(), }]));
    };

    const updateItem = (index: number, field: keyof Tax, val: string | number | boolean) => {
        const newTaxes = [...taxes]; // Copiamos el array

        // Actualizamos el campo cambiado
        newTaxes[index] = {
            ...newTaxes[index],
            [field]: val
        };

        // Recalculamos el value si tenemos base y porcentaje
        const { porcentage, base } = newTaxes[index];

        if (porcentage !== null && porcentage !== '' && base !== '') {
            newTaxes[index] = {
                ...newTaxes[index], // 🔥 Mantenemos las otras propiedades
                value: Number((Number(porcentage) * Number(base) * 0.01).toFixed(2))
            };
        } else {
            newTaxes[index] = {
                ...newTaxes[index],
                value: 0
            };
        }

        setTaxes(newTaxes); // Seteamos el nuevo array

        // 💥 Aquí quitamos el error específico
        const id = newTaxes[index].id;
        setErrorTaxes(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: '', // ✅ Limpiar solo el campo corregido
            }
        }));
    };


    const selectRetention = (index: number, retention: TaxInput) => {
        const newTaxes = [...taxes]; // Copiamos el array
        newTaxes[index] = {
            ...newTaxes[index],
            tax_code: retention.code,
            porcentage: retention.porcentage,
            editable_porcentage: retention.porcentage === null,
        };
        setTaxes(newTaxes);

        // 💥 Aquí quitamos el error específico
        const id = newTaxes[index].id;
        setErrorTaxes(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                tax_code: '', // ✅ Limpiar solo el campo corregido
            }
        }));
    };

    const deleteItem = (index: number) => {
        let prods = taxes;
        prods = prods.filter((_, indexTax) => indexTax !== index);
        setTaxes(prods);
    };

    return { addItem, updateItem, selectRetention, deleteItem }
}
