import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { importProductsServices } from "../services/productServices";
import { ProductCsv } from "@/types";

export const useImportExcel = () => {
    const axiosAuth = useAxiosAuth();

    const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;

        if (!input.files || input.files.length === 0) return;

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                uploadCsv(reader.result);
            }
        };

        reader.readAsText(input.files[0], 'ISO-8859-1');
    };

    const uploadCsv = (csv: string) => {
        const lines = csv.split(/\r\n|\n/);
        const products: ProductCsv[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().length === 0) continue;

            const words = line.split(';');

            const object: ProductCsv = {
                code: words[0]?.trim() || '',
                type_product: words[1]?.trim() || '',
                name: words[2]?.trim() || '',
                price1: words[3] || '',
                iva: words[4] || '',
                stock: words[5] && words[5].trim() !== '' ? words[5].trim() : null,
            };

            products.push(object);
        }

        saveProductsFromCsv(products);
    };

    const saveProductsFromCsv = async (products: ProductCsv[]) => {

        const res = await importProductsServices(axiosAuth, products);
        console.log(res);
        window.location.reload();
    };

    return { handleSelectFile };
};
