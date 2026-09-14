import { useFormInvoice } from "../context/FormInvoiceContext";
import { productOutputSchema } from "@/schemas/product-output.schema";
import { initialProductItem } from "@/constants/initialValues";
import { fields, ProductOutput, ProductProps } from "@/types";
import { calculateInvoiceTotals, calculateLineTotal } from "@/helpers/invoiceTotalsHelper";
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

        if (field === 'total_iva') {
            const { percentage } = updated
            const quantity = updated.quantity === '' ? 0 : Number(updated.quantity);
            updated.price = parseFloat((Number(value) / quantity / (1 + (percentage / 100))).toFixed(6))
        } else if (field !== 'ice') {
            updated.total_iva = calculateLineTotal(updated);
        }

        const prods = productOutputs.map((item, i) => i === index ? updated : item);
        recalculate(prods);
    };

    // Seleccionar producto para un Item
    const selectProduct = (index: number, product: ProductProps) => {
        const updated: ProductOutput = {
            ...productOutputs[index],
            product_id: product.id,
            aux_cod: product.atts.aux_cod,
            name: product.atts.name,
            price: product.atts.price1,
            quantity: 1,
            discount: 0,
            stock: 1,
            total_iva: (product.atts.price1 * (1 + product.iva.percentage / 100)).toFixed(2),
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

    return { productOutputs, addItem, updateItem, selectProduct, removeItem }
}