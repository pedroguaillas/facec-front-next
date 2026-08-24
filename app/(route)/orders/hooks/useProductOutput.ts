import { useFormInvoice } from "../context/FormInvoiceContext";
import { productOutputSchema } from "@/schemas/product-output.schema";
import { initialProductItem } from "@/constants/initialValues";
import { fields, ProductOutput, ProductProps } from "@/types";
import { calculateInvoiceTotals } from "@/helpers/invoiceTotalsHelper";
import { nanoid } from "nanoid";

export const useProductOutput = () => {

    const { productOutputs, setInvoice, setProductOutputs, setErrorProductOutputs, setIsActiveIce } = useFormInvoice();

    const addItem = () => {
        setProductOutputs((prev) => ([...prev, { ...initialProductItem, id: nanoid(), }]));
    };

    // Modificar campos del Item Product
    const updateItem = (index: number, field: fields, value: string | number) => {
        if (value && Number(value) < 0) return
        const updated: ProductOutput = { ...productOutputs[index], [field]: value };

        // Validar ese campo
        const validation = productOutputSchema.safeParse(updated);

        if (!validation.success) {
            const fieldError = validation.error.flatten().fieldErrors;
            setErrorProductOutputs(prev => ({
                ...prev,
                [updated.id]: {
                    ...prev[updated.id],
                    [field]: fieldError[field]?.[0] || ""
                }
            }));
        } else {
            // Si está correcto, limpiar error de ese campo
            setErrorProductOutputs(prev => ({
                ...prev,
                [updated.id]: {
                    ...prev[updated.id],
                    [field]: ""
                }
            }));
        }

        let { quantity, price, discount } = updated
        const { percentage } = updated
        quantity = quantity === '' ? 0 : Number(quantity);
        price = price === '' ? 0 : Number(price);
        discount = discount === '' ? 0 : Number(discount);
        if (field === 'total_iva') {
            updated.price = parseFloat((Number(value) / quantity / (1 + (percentage / 100))).toFixed(6))
        } else if (field !== 'ice') {
            updated.total_iva = parseFloat((price * quantity - discount).toFixed(2));
        }

        const prods = productOutputs.map((item, i) => i === index ? updated : item);
        recalculate(prods);
    };

    // Seleccionar producto para un Item
    const selectProduct = (index: number, product: ProductProps) => {
        const updated: ProductOutput = {
            ...productOutputs[index],
            product_id: product.id,
            price: product.atts.price1,
            quantity: 1,
            discount: 0,
            stock: 1,
            total_iva: product.atts.price1.toFixed(2),
            //   TODO Agregar Si es turismo
            iva: product.iva.code,
            percentage: product.iva.percentage,
        };
        if (product.atts.ice !== null) {
            updated.ice = '';
            setIsActiveIce(true);
        }
        // Si está correcto, limpiar error de ese campo
        setErrorProductOutputs(prev => ({
            ...prev,
            [updated.id]: {
                ...prev[updated.id],
                product_id: ""
            }
        }));

        const prods = productOutputs.map((item, i) => i === index ? updated : item);
        recalculate(prods);
    }

    // Eliminar producto
    const removeItem = (index: number) => {
        let prods = productOutputs;
        prods = prods.filter((_, indexProduct) => indexProduct !== index);
        recalculate(prods);
    };

    //Method caculate totals & modify state all.
    const recalculate = (productOutpus: ProductOutput[]) => {
        setProductOutputs(productOutpus);
        setInvoice(prevState => ({ ...prevState, ...calculateInvoiceTotals(productOutpus) }));
    };

    //Desglose del valor total
    // const breakdown = useCallback((breakdown: boolean) => {
    const breakdown = (breakdown: boolean) => {
        const updatedProds = productOutputs.map(item => {
            const base = (Number(item.price) * Number(item.quantity)) - Number(item.discount);
            return {
                ...item,
                total_iva: parseFloat((!breakdown ? base : base * (1 + item.percentage / 100)).toFixed(2)),
            };
        });
        setProductOutputs(updatedProds);
    };

    return { productOutputs, addItem, updateItem, selectProduct, breakdown, removeItem }
}