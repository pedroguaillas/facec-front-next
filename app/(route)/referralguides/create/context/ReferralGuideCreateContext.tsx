"use client";

import { CustomerProps, EmisionPoint, ProductInput, ProductOutput, ReferralGuideCreateProps } from "@/types";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getDate } from "@/helpers/dateHelper";
import { useSession } from "next-auth/react";
import { getCreateReferralGuide } from "../services/createReferralGuideServices";

interface ReferralGuideContextType {
  referralGuide: ReferralGuideCreateProps;
  points: EmisionPoint[];
  selectPoint: EmisionPoint | null;
  selectCustom: CustomerProps | null;
  productInputs: ProductInput[];
  productOutputs: ProductOutput[];
  errors: Partial<Record<keyof ReferralGuideCreateProps, string>>;
  setReferralGuide: Dispatch<SetStateAction<ReferralGuideCreateProps>>;
  errorProductOutputs: Record<string, Partial<Record<keyof ProductOutput, string>>>;
  setSelectPoint: Dispatch<SetStateAction<EmisionPoint | null>>;
  setSelectCustom: Dispatch<SetStateAction<CustomerProps | null>>;
  setProductInputs: Dispatch<SetStateAction<ProductInput[]>>;
  setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
  setErrors: Dispatch<SetStateAction<Partial<Record<keyof ReferralGuideCreateProps, string>>>>;
  setErrorProductOutputs: Dispatch<SetStateAction<Record<string, Partial<Record<keyof ProductOutput, string>>>>>;
}

const ReferralGuideCreateContext = createContext<ReferralGuideContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const initialReferralGuide: ReferralGuideCreateProps = {
  serie: 'Cree un punto de emisión',
  date_start: getDate(),
  date_end: getDate(),
  carrier_id: 0,
  customer_id: 0,
  address_from: '',
  address_to: '',
  reason_transfer: ''
}

export const ReferralGuideCreateProvider = ({ children }: Props) => {
  const [referralGuide, setReferralGuide] = useState<ReferralGuideCreateProps>(initialReferralGuide);
  const [points, setPoints] = useState<EmisionPoint[]>([]);
  const [selectCustom, setSelectCustom] = useState<CustomerProps | null>(null);
  const [selectPoint, setSelectPoint] = useState<EmisionPoint | null>(null);
  const [productInputs, setProductInputs] = useState<ProductInput[]>([]);
  const [productOutputs, setProductOutputs] = useState<ProductOutput[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ReferralGuideCreateProps, string>>>({});
  const [errorProductOutputs, setErrorProductOutputs] = useState<Record<string, Partial<Record<keyof ProductOutput, string>>>>({});
  const { status } = useSession();
  const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

  useEffect(() => {
    const fetchCreateReferralGuide = async () => {
      if (status !== "authenticated") return;

      try {
        const data = await getCreateReferralGuide(axiosAuth);
        const { points } = data;
        setPoints(points);
      } catch (error) {
        console.error("Error al cargar: ", error);
      }
    };

    fetchCreateReferralGuide();
  }, [status, axiosAuth]);

  return (
    <ReferralGuideCreateContext.Provider value={{
      referralGuide, points, selectCustom, selectPoint, productInputs, productOutputs, errors, errorProductOutputs,
      setReferralGuide, setSelectPoint, setSelectCustom, setProductInputs, setProductOutputs, setErrors, setErrorProductOutputs,
    }}>
      {children}
    </ReferralGuideCreateContext.Provider>
  )
}

export const useReferralGuide = () => {
  const context = useContext(ReferralGuideCreateContext);
  if (!context) {
    throw new Error("useReferralGuide must be used within an useReferralProvider");
  }
  return context;
}
