import { Customer } from "@/types";
import { AxiosInstance } from "axios";

export const findCustomerByIdentification = async (
    axiosAuth: AxiosInstance,
    identication: string
): Promise<Customer | null> => {

    const url = identication.length === 10 ? 'searchByCedula' : 'searchByRuc';
    try {
        const res = await axiosAuth.get(`customers/${url}/${identication}`);
        return res.data.customer as Customer;
    } catch (err) {
        console.log(err)
        return null;
    }
}

export const storeCustomer = async (
    axiosAuth: AxiosInstance,
    data: unknown
): Promise<Customer | null> => {

    try {
        const response = await axiosAuth.post('customers', data);
        return response.data.customer as Customer;
    }
    catch (error) {
        console.error('Error creating customer:', error);
        return null;
    }
}

export const updateCustomer = async (
    id: string,
    axiosAuth: AxiosInstance,
    data: unknown
): Promise<Customer | null> => {

    try {
        const response = await axiosAuth.put('customers/' + id, data);
        return response.data.customer as Customer;
    }
    catch (error) {
        console.error('Error creating customer:', error);
        return null;
    }
}