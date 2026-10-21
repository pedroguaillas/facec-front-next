import { limitDecimals } from "@/helpers/numberHelper";
import { useProductCreateContext } from "../context/ProductFormContext";
import { useEffect, useState } from "react";

interface IvaTaxOption {
    value: number | string; // código SRI de la tarifa (ej. 4 = 15%)
    label: string; // "15%"
    percentage?: number;
}

// Tarifa (%) del código de IVA seleccionado; usa `percentage` si el backend lo manda, si no el label "15%"
const ivaRateOf = (taxes: IvaTaxOption[], code: number) => {
    const tax = taxes.find(t => Number(t.value) === Number(code));
    if (!tax) return 0;
    return tax.percentage ?? (parseFloat(tax.label) || 0);
};

// Precio sin IVA a partir del total con IVA
const priceFromTotal = (total: string, rate: number) => {
    const value = parseFloat(total);
    return Number.isFinite(value) ? parseFloat((value / (1 + rate / 100)).toFixed(6)) : null;
};

export const useProductForm = () => {

    const {
        product, errorProduct, ivaTaxes, iceCataloges, sriCategories,
        setProduct, setErrorProduct
    } = useProductCreateContext();
    const [breakdown, setBreakdown] = useState<boolean>(false);
    const [total, setTotal] = useState('');

    const ivaRate = ivaRateOf(ivaTaxes as IvaTaxOption[], product.iva);
    // Con IVA 0% (o exento / no objeto) no hay nada que desglosar
    const canBreakdown = ivaRate > 0;

    // Si la tarifa guardada ya no está permitida (ej. RIMPE Negocio Popular solo admite 0%),
    // se ajusta a la primera disponible para no enviar un código que el backend rechaza
    useEffect(() => {
        const taxes = ivaTaxes as IvaTaxOption[];
        if (taxes.length === 0) return;
        if (!taxes.some(tax => Number(tax.value) === Number(product.iva))) {
            setProduct(prev => ({ ...prev, iva: Number(taxes[0].value) }));
        }
    }, [ivaTaxes, product.iva, setProduct]);

    // Al cambiar la tarifa: sin IVA se apaga el desglose; con IVA se recalcula el precio desde el total
    useEffect(() => {
        if (!canBreakdown) {
            setBreakdown(false);
            return;
        }
        if (breakdown && total) {
            const price = priceFromTotal(total, ivaRate);
            if (price !== null) setProduct(prev => ({ ...prev, price1: price }));
        }
    }, [ivaRate, canBreakdown]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value: raw } = event.target;
        // Stock y mínimo admiten hasta 6 decimales en el backend (igual que el kardex)
        const value = name === 'stock' || name === 'min_stock' ? limitDecimals(raw, 6) : raw;
        setProduct((prevState) => ({ ...prevState, [name]: value }))
        setErrorProduct(prev => ({ ...prev, [name]: '' }))
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        const numValue = Number(value);
        setProduct((prevState) => {
            // Servicio no admite IVA 5% (categoría ferretería exclusiva de Producto)
            if (name === 'type_product' && numValue === 2 && prevState.iva === 5) {
                return { ...prevState, [name]: numValue, iva: 4 };
            }
            return { ...prevState, [name]: numValue };
        })
        setErrorProduct(prev => ({ ...prev, [name]: '' }))
    }

    // El 8% en feriados solo reemplaza al 15%: con otra tarifa no aplica
    useEffect(() => {
        if (product.iva !== 4 && product.differentiated_iva) {
            setProduct(prev => ({ ...prev, differentiated_iva: false }));
        }
    }, [product.iva, product.differentiated_iva, setProduct]);

    const toggleDifferentiatedIva = () => {
        setProduct(prev => ({ ...prev, differentiated_iva: !prev.differentiated_iva }));
        setErrorProduct(prev => ({ ...prev, differentiated_iva: '' }));
    };

    const onChangeCheckbox = () => {
        setBreakdown(!breakdown);
    }

    const handleTotal = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value) || value === '') {
            setTotal(value);
            const price = priceFromTotal(value, ivaRate);
            if (price !== null) setProduct((prevState) => ({ ...prevState, price1: price }));
        }
    }

    const optionType = [
        { value: 1, label: 'Producto' },
        { value: 2, label: 'Servicio' },
    ];

    return {
        product, errorProduct, optionType, ivaTaxes, iceCataloges, sriCategories, breakdown, total, ivaRate, canBreakdown,
        handleChange, handleSelect, onChangeCheckbox, handleTotal, toggleDifferentiatedIva
    };
}
