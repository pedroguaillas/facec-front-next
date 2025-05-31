import { AxiosInstance } from "axios";

export const downloadXml = async (route: string, axiosAuth: AxiosInstance, name: string) => {
    try {
        const response = await axiosAuth.get(route);
        if (response.status >= 200) {
            const a = document.createElement('a') //Create <a>
            a.href = 'data:text/xml;base64,' + response.data.xml //Image Base64 Goes here
            a.download = `${name}.xml`//File name Here
            a.click() //Downloaded file
        }
    } catch (error) {
        console.log(error)
    }
}