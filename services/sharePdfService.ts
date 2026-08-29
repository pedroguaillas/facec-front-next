import { AxiosInstance } from "axios";

export const canShareFiles = () =>
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function";

export const sharePdf = async (route: string, axiosAuth: AxiosInstance, name: string) => {
    try {
        const response = await axiosAuth.get(route, { responseType: "blob" });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const file = new File([blob], `${name}.pdf`, { type: "application/pdf" });

        if (!navigator.canShare({ files: [file] })) {
            alert("Este dispositivo no soporta compartir archivos.");
            return;
        }

        await navigator.share({ files: [file], title: name });
    } catch (error) {
        console.error("Error al compartir el PDF:", error);
    }
};
