import { useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { importProducts } from "../services/productServices";

interface UseImportExcelOptions {
    onSuccess?: () => void;
}

interface ImportResult {
    tone: "danger" | "info";
    text: string;
}

export const useImportExcel = ({ onSuccess }: UseImportExcelOptions = {}) => {
    const axiosAuth = useAxiosAuth();
    const [isPending, setIsPending] = useState(false);
    const [result, setResult] = useState<ImportResult | undefined>();

    const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;

        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        // Se limpia antes del await para poder volver a seleccionar el mismo archivo
        input.value = "";

        setResult(undefined);
        setIsPending(true);
        const { data, error, errors } = await importProducts(axiosAuth, file);
        setIsPending(false);

        if (error) {
            setResult({ tone: "danger", text: error });
            return;
        }

        if (errors) {
            setResult({ tone: "danger", text: Object.values(errors)[0] });
            return;
        }

        setResult({ tone: "info", text: data?.message ?? "Productos importados correctamente" });
        onSuccess?.();
    };

    return { handleSelectFile, isPending, result };
};
