import { AxiosInstance } from "axios";

export const findCompanyByRuc = async (
    axiosAuth: AxiosInstance,
    ruc: string
): Promise<{ company: string } | null> => {
    try {
        const res = await axiosAuth.get(`admin/companies/sri/${ruc}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}