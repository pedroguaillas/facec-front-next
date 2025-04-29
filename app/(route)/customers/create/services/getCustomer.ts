import { AxiosInstance } from "axios";

export const getCustomer = async (
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
