import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { importProducts } from "../services/productServices";

export const useImportExcel = () => {
    const axiosAuth = useAxiosAuth();

    const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;

        if (!input.files || input.files.length === 0) return;

        const res = await importProducts(axiosAuth, input.files[0]);
        console.log(res);
        window.location.reload();

        input.value = "";
    };

    return { handleSelectFile };
};
