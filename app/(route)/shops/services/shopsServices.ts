import { handleApiRequest } from "@/helpers/apiHandler";
import { EmisionPoint, GeneralPaginate, ProductOutput, ShopCreateProps, ShopProps, Supplier, Tax, TaxInput } from "@/types";
import { AxiosInstance } from "axios";

export const getShops = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
) => handleApiRequest<GeneralPaginate<ShopProps>>(() => axiosAuth.get(pageUrl));

interface ResCreateShop { points: EmisionPoint[], taxes: TaxInput[] }

export const getCreateShop = async (
    axiosAuth: AxiosInstance,
) => handleApiRequest<ResCreateShop>(() => axiosAuth.get('shops/create'));

export const shopStoreService = async (
    axiosAuth: AxiosInstance,
    form: object
) => handleApiRequest<ShopCreateProps>(() => axiosAuth.post('shops', form));

interface ResUpdateShop { shop: ShopCreateProps, provider: Supplier, shopretentionitems: Tax[], taxes: TaxInput[], shop_items: ProductOutput[] }

export const getShop = async (
    axiosAuth: AxiosInstance,
    id: string,
) => handleApiRequest<ResUpdateShop>(() => axiosAuth.get(`shops/${id}`));

export const shopUpdateService = async (
    id: number,
    axiosAuth: AxiosInstance,
    form: object
) => handleApiRequest<ShopProps>(() => axiosAuth.put(`shops/${id}`, form));