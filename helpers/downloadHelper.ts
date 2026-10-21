import { AxiosInstance } from "axios";

type Params = Record<string, string | number | undefined>;

// Descarga un archivo (blob) del backend respetando el nombre de Content-Disposition.
// Devuelve un mensaje de error o null si se descargó.
export const downloadFile = async (
    axiosAuth: AxiosInstance,
    url: string,
    params: Params,
    fallbackName: string,
): Promise<string | null> => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
    try {
        const response = await axiosAuth.get(url, { params: cleanParams, responseType: 'blob' });
        const disposition: string = response.headers['content-disposition'] ?? '';
        const match = disposition.match(/filename="?([^";]+)"?/);
        const blob = new Blob([response.data], { type: response.headers['content-type'] ?? 'application/octet-stream' });
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = match ? match[1] : fallbackName;
        a.click();
        URL.revokeObjectURL(href);
        return null;
    } catch (error) {
        // Con responseType blob el JSON de error (422) llega como Blob
        const data = (error as { response?: { data?: Blob } }).response?.data;
        if (data instanceof Blob) {
            try {
                const json = JSON.parse(await data.text());
                return json.message ?? 'No se pudo descargar el reporte';
            } catch {
                // no es JSON
            }
        }
        return 'No se pudo descargar el reporte';
    }
};
