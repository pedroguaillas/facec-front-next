import { handleApiRequest } from "@/helpers/apiHandler";
import {
    ApiResponse,
    GeneralPaginate,
    InventoryCostOfSales,
    InventoryMovement,
    InventoryOperationResponse,
    InventoryStockItem,
    InventoryValuation,
    LaravelPaginator,
    Warehouse,
} from "@/types";
import { AxiosInstance } from "axios";

type Params = Record<string, string | number | undefined>;

// Quita filtros vacíos para no mandar `warehouse_id=` al backend
const clean = (params: Params) =>
    Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));

// Bodegas
export const getWarehouses = async (axiosAuth: AxiosInstance): Promise<ApiResponse<Warehouse[]>> =>
    handleApiRequest<Warehouse[]>(() => axiosAuth.get('warehouses'));

export const storeWarehouse = async (axiosAuth: AxiosInstance, form: { name: string }): Promise<ApiResponse<Warehouse>> =>
    handleApiRequest<Warehouse>(() => axiosAuth.post('warehouses', form));

export const updateWarehouse = async (axiosAuth: AxiosInstance, id: number, form: { name: string }): Promise<ApiResponse<Warehouse>> =>
    handleApiRequest<Warehouse>(() => axiosAuth.put(`warehouses/${id}`, form));

export const deleteWarehouse = async (axiosAuth: AxiosInstance, id: number) =>
    handleApiRequest<{ succes: boolean; message: string }>(() => axiosAuth.delete(`warehouses/${id}`));

// Operaciones
export const storeOpeningBalance = async (axiosAuth: AxiosInstance, form: object): Promise<ApiResponse<InventoryOperationResponse>> =>
    handleApiRequest<InventoryOperationResponse>(() => axiosAuth.post('inventory/opening-balance', form));

export const storeAdjustment = async (axiosAuth: AxiosInstance, form: object): Promise<ApiResponse<InventoryOperationResponse>> =>
    handleApiRequest<InventoryOperationResponse>(() => axiosAuth.post('inventory/adjustments', form));

export const storeTransfer = async (axiosAuth: AxiosInstance, form: object): Promise<ApiResponse<InventoryOperationResponse>> =>
    handleApiRequest<InventoryOperationResponse>(() => axiosAuth.post('inventory/transfers', form));

// Reportes
export const getInventoryStock = async (axiosAuth: AxiosInstance, params: Params): Promise<ApiResponse<LaravelPaginator<InventoryStockItem>>> =>
    handleApiRequest<LaravelPaginator<InventoryStockItem>>(() => axiosAuth.get('inventory/stock', { params: clean(params) }));

export const getKardex = async (axiosAuth: AxiosInstance, productId: string, params: Params): Promise<ApiResponse<GeneralPaginate<InventoryMovement>>> =>
    handleApiRequest<GeneralPaginate<InventoryMovement>>(() => axiosAuth.get(`products/${productId}/kardex`, { params: clean(params) }));

export const getValuation = async (axiosAuth: AxiosInstance, params: Params): Promise<ApiResponse<InventoryValuation>> =>
    handleApiRequest<InventoryValuation>(() => axiosAuth.get('inventory/valuation', { params: clean(params) }));

export const getCostOfSales = async (axiosAuth: AxiosInstance, params: Params): Promise<ApiResponse<InventoryCostOfSales>> =>
    handleApiRequest<InventoryCostOfSales>(() => axiosAuth.get('inventory/cost-of-sales', { params: clean(params) }));
