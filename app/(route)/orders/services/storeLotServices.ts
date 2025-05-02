import { AxiosInstance } from "axios";

export const storeLotServices = async (axiosAuth: AxiosInstance, formData: FormData) => {
    try {
        const res = await axiosAuth.post('orders/lot', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log(res);
    } catch (err) {
        console.error(err);
    }
}