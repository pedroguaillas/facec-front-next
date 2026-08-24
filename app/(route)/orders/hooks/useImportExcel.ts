import { useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { storeLotServices } from "../services/invoicesServices";

interface UseImportExcelOptions {
    onSuccess?: () => void;
}

export const useImportExcel = ({ onSuccess }: UseImportExcelOptions = {}) => {
    const axiosAuth = useAxiosAuth();
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<string | undefined>();

    const sendLote = async (xlsm: File) => {
        const formData = new FormData();
        formData.append("lot", xlsm);
        formData.append("point_id", "1");

        setMessage(undefined);
        setIsPending(true);
        const { error, errors } = await storeLotServices(axiosAuth, formData);
        setIsPending(false);

        if (error) {
            setMessage(error);
            return;
        }

        if (errors) {
            setMessage(Object.values(errors)[0]);
            return;
        }

        // Sin error/errors = subida OK, aunque el backend no devuelva "data"
        // (p. ej. si la carga se procesa en cola y responde vacío).
        onSuccess?.();
    };

    const handleLote = (e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
        let files: FileList | null;

        if ("dataTransfer" in e) {
            files = e.dataTransfer?.files ?? null;
        } else {
            files = e.target.files;
        }

        if (!files || files.length === 0) return;

        const file = files[0];
        sendLote(file);

        if (!("dataTransfer" in e)) {
            e.target.value = "";
        }
    };

    return { handleLote, isPending, message };
};
