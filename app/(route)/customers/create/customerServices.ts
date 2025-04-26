import { AxiosInstance } from "axios";

export const storeCustomer = async (axiosAuth: AxiosInstance, data: unknown) => {

    try {
        const response = await axiosAuth.post('customers', data);
        return response.data;
    }
    catch (error) {
        console.error('Error creating customer:', error);
        return [];
    }
}