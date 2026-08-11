import { AxiosInstance } from "axios";

export const downloadXml = async (route: string, axiosAuth: AxiosInstance, name: string) => {
    try {
        const response = await axiosAuth.get(route, { responseType: 'blob' });
        if (response.status >= 200) {
            const blob = new Blob([response.data], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a')
            a.href = url
            a.download = `${name}.xml`
            a.click()
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.log(error)
    }
}
