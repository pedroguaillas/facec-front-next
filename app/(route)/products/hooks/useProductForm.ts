import { useProductCreateContext } from "../context/ProductFormContext";
import { useState } from "react";

export const useProductForm = () => {

    const { product, errorProduct, ivaTaxes, iceCataloges, setProduct, setErrorProduct } = useProductCreateContext();
    const [breakdown, setBreakdown] = useState<boolean>(false);
    const [total, setTotal] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setProduct((prevState) => ({ ...prevState, [name]: value }))
        setErrorProduct(prev => ({ ...prev, [name]: '' }))
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setProduct((prevState) => ({ ...prevState, [name]: Number(value) }))
        setErrorProduct(prev => ({ ...prev, [name]: '' }))
    }

    const onChangeCheckbox = () => {
        setBreakdown(!breakdown);
    }

    const handleTotal = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value) || value === '') {
            setTotal(value);
            const price = parseFloat((parseFloat(value) / 1.15).toFixed(6));
            setProduct((prevState) => ({ ...prevState, price1: price }));
        }
    }

    const optionType = [
        { value: 1, label: 'Producto' },
        { value: 2, label: 'Servicio' },
    ];

    return { product, errorProduct, optionType, ivaTaxes, iceCataloges, breakdown, total, handleChange, handleSelect, onChangeCheckbox, handleTotal };
}
