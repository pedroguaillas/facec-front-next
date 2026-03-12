import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, CarrierProps, CustomerProps, EmisionPoint, GeneralPaginate, ProductOutput, ReferralGuideCreateProps, ReferralGuideProps } from "@/types";
import { AxiosInstance } from "axios";

export const getReferralGuides = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<ReferralGuideProps>>> =>
    handleApiRequest<GeneralPaginate<ReferralGuideProps>>(() => axiosAuth.get(pageUrl));

export const getCreateReferralGuide = async (
    axiosAuth: AxiosInstance
): Promise<ApiResponse<EmisionPoint[]>> =>
    handleApiRequest<EmisionPoint[]>(() => axiosAuth.get('referralguides/create'));

interface ReferrralGuideForView { referralguide: ReferralGuideCreateProps, customers: CustomerProps[], carriers: CarrierProps[], referralguide_items: ProductOutput[] };

export const getReferralGuide = async (
    axiosAuth: AxiosInstance,
    id: string
) => handleApiRequest<ReferrralGuideForView>(() => axiosAuth.get(`referralguides/${id}`));