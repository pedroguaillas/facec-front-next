import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { storeLotServices } from "../services/storeLotServices";

export const useImportExcel = () => {
    const axiosAuth = useAxiosAuth();

    const sendLote = async (xlsm: File) => {
        const formData = new FormData();
        formData.append("lot", xlsm);
        formData.append("point_id", "1");

        await storeLotServices(axiosAuth, formData);
    };

    const handleLote = (
        e: React.ChangeEvent<HTMLInputElement> | DragEvent
    ) => {
        let files: FileList | null;

        if ("dataTransfer" in e) {
            files = e.dataTransfer?.files ?? null;
        } else {
            files = e.target.files;
        }

        if (!files || files.length === 0) return;

        const file = files[0];
        sendLote(file);
    };

    return { handleLote };
};
