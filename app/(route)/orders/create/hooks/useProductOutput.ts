import { useCreateInvoice } from "../../context/InvoiceCreateContext";
import { productOutputSchema } from "@/schemas/product-output.schema";
import { initialProductItem } from "@/constants/initialValues";
import { fields, ProductOutput, ProductProps } from "@/types";
import { nanoid } from "nanoid";

export const useProductOutput = () => {

    const { productOutputs, setInvoice, setProductOutputs, setErrorProductOutputs } = useCreateInvoice();

    const addItem = () => {
        setProductOutputs((prev) => ([...prev, { ...initialProductItem, id: nanoid(), }]));
    };

    // Modificar campos del Item Product
    const updateItem = (index: number, field: fields, value: string | number) => {
        if (value && Number(value) < 0) return
        const prods = productOutputs;
        prods[index][field] = value;

        // Validar ese campo
        const validation = productOutputSchema.safeParse(prods[index]);

        if (!validation.success) {
            const fieldError = validation.error.flatten().fieldErrors;
            setErrorProductOutputs(prev => ({
                ...prev,
                [prods[index].id]: {
                    ...prev[prods[index].id],
                    [field]: fieldError[field]?.[0] || ""
                }
            }));
        } else {
            // Si está correcto, limpiar error de ese campo
            setErrorProductOutputs(prev => ({
                ...prev,
                [prods[index].id]: {
                    ...prev[prods[index].id],
                    [field]: ""
                }
            }));
        }

        let { quantity, price, discount } = prods[index]
        const { percentage } = prods[index]
        quantity = quantity === '' ? 0 : Number(quantity);
        price = price === '' ? 0 : Number(price);
        discount = discount === '' ? 0 : Number(discount);
        if (field === 'total_iva') {
            prods[index].price = parseFloat((Number(value) / quantity / (1 + (percentage / 100))).toFixed(6))
        } else if (field !== 'ice') {
            prods[index].total_iva = parseFloat((price * quantity - discount).toFixed(2));
        }
        recalculate(prods);
    };

    // Seleccionar producto para un Item
    const selectProduct = (index: number, product: ProductProps) => {
        const prods = productOutputs;
        prods[index].product_id = product.id;
        prods[index].price = product.atts.price1;
        prods[index].quantity = 1;
        prods[index].discount = 0;
        prods[index].stock = 1;
        prods[index].total_iva = product.atts.price1.toFixed(2);
        if (product.atts.ice !== null) {
            prods[index].ice = '';
        }
        //   TODO Agregar Si es turismo
        prods[index].iva = product.iva.code;
        prods[index].percentage = product.iva.percentage;
        // Si está correcto, limpiar error de ese campo
        setErrorProductOutputs(prev => ({
            ...prev,
            [prods[index].id]: {
                ...prev[prods[index].id],
                product_id: ""
            }
        }));

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
        let no_iva = 0;
        let base0 = 0;
        let base5 = 0;
        let base8 = 0;
        let base12 = 0;
        let base15 = 0;
        let totalDiscount = 0;
        let totalIce = 0;

        productOutpus.forEach(({ quantity, price, discount, iva, total_iva, ice }) => {
            totalIce += ice !== undefined ? Number(ice) : 0
            totalDiscount += discount !== '' ? Number(discount) : 0
            if (iva !== undefined) {
                // IVA = 0% el total_iva = price * quantity - discount + 0 (0% IVA)
                no_iva += iva === 6 ? Number(total_iva) : 0;
                base0 += iva === 0 ? Number(total_iva) : 0;
                // IVA > 0% entonces total_iva = price * quantity - discount + Valor del IVA (5%-8%-12%-15%)
                base5 += iva === 5 ? Number(price) * Number(quantity) - Number(discount) : 0;
                base8 += iva === 8 ? Number(price) * Number(quantity) - Number(discount) : 0;
                base12 += iva === 2 ? Number(price) * Number(quantity) - Number(discount) : 0;
                base15 += iva === 4 ? Number(price) * Number(quantity) - Number(discount) : 0;
            }
        });

        const sub_total = no_iva + base0 + base5 + base8 + base12 + base15;

        const iva5 = Number((base5 * 0.05).toFixed(2));
        const iva8 = Number((base8 * 0.08).toFixed(2));
        const iva = base12 > 0 ? Number(((base12 + Number(totalIce)) * 0.12).toFixed(2)) : 0;
        const iva15 = base15 > 0 ? Number(((base15 + Number(totalIce)) * 0.15).toFixed(2)) : 0;
        const totalIva = Number((iva5 + iva8 + iva + iva15).toFixed(2));

        const total = sub_total + Number(totalIce) + totalIva;

        setProductOutputs(productOutpus);

        setInvoice(prevState => ({
            ...prevState, no_iva,
            base0,
            base5,
            base8,
            base12,
            base15,
            sub_total,
            ice: totalIce,
            discount: totalDiscount,
            iva5,
            iva8,
            iva,
            iva15,
            total
        }));
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