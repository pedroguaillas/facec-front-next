"use client";

import { createContext, useState, useContext, useEffect, ReactNode, SetStateAction, Dispatch } from "react";
import { getCreateInvoice } from "../services/invoicesServices";
import { initialProductItem } from "@/constants/initialValues";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { useSession } from "next-auth/react";
import { nanoid } from "nanoid";

interface InvoicesContextType {
  invoice: OrderCreateProps;
  payMethods: PayMethod[];
  points: EmisionPoint[];
  selectPoint: EmisionPoint | null;
  selectCustom: CustomerProps | null;
  tourism: boolean;
  productInputs: ProductInput[];
  productOutputs: ProductOutput[];
  errorProductOutputs: Record<string, Partial<Record<keyof ProductOutput, string>>>;
  aditionalInformation: AditionalInformation[];
  errorAditionalInformation: Record<string, Partial<Record<keyof AditionalInformation, string>>>;
  formErrors: InvoiceErrors;
  isTaxBreakdown: boolean;
  isActiveIce: boolean;
  setInvoice: Dispatch<SetStateAction<OrderCreateProps>>; // Exposed for manual fetch
  setSelectPoint: Dispatch<SetStateAction<EmisionPoint | null>>;
  setSelectCustom: Dispatch<SetStateAction<CustomerProps | null>>;
  setProductInputs: Dispatch<SetStateAction<ProductInput[]>>;
  setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
  setErrorProductOutputs: Dispatch<SetStateAction<Record<string, Partial<Record<keyof ProductOutput, string>>>>>;
  setAditionalInformation: Dispatch<SetStateAction<AditionalInformation[]>>;
  setErrorAditionalInformation: Dispatch<SetStateAction<Record<string, Partial<Record<keyof AditionalInformation, string>>>>>;
  setFormErrors: Dispatch<SetStateAction<InvoiceErrors>>;
  setIsTaxBreakdown: Dispatch<SetStateAction<boolean>>;
  setIsActiveIce: Dispatch<SetStateAction<boolean>>;
}

const InvoiceCreateContext = createContext<InvoicesContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}
const dateType = new Date();
dateType.setHours(dateType.getHours() - 5);
const date = dateType.toISOString().substring(0, 10);

const initialInvoice: OrderCreateProps = {
  serie: 'Cree un punto de emisión',
  date,
  expiration_days: 0,
  no_iva: 0,
  base0: 0,
  base5: 0,
  base8: 0,
  base12: 0,
  base15: 0,
  iva5: 0,
  iva8: 0,
  iva: 0,
  iva15: 0,
  ice: 0,
  sub_total: 0,
  discount: 0,
  total: 0,
  description: null,
  customer_id: 0,
  received: 0,
  doc_realeted: 0,
  voucher_type: 1,
  pay_method: 20,
};

const createNewProductItem = (): ProductOutput => ({
  ...initialProductItem,
  id: nanoid(),
});

export const InvoiceCreateProvider = ({ children }: Props) => {
  const [invoice, setInvoice] = useState<OrderCreateProps>(initialInvoice);
  const [selectPoint, setSelectPoint] = useState<EmisionPoint | null>(null);
  const [selectCustom, setSelectCustom] = useState<CustomerProps | null>(null);
  const [productInputs, setProductInputs] = useState<ProductInput[]>([]);
  const [productOutputs, setProductOutputs] = useState<ProductOutput[]>([createNewProductItem()]);
  const [errorProductOutputs, setErrorProductOutputs] = useState<Record<string, Partial<Record<keyof ProductOutput, string>>>>({});
  const [payMethods, setPayMethods] = useState<PayMethod[]>([]);
  const [points, setPoints] = useState<EmisionPoint[]>([]);
  const [aditionalInformation, setAditionalInformation] = useState<AditionalInformation[]>([]);
  const [errorAditionalInformation, setErrorAditionalInformation] = useState<Record<string, Partial<Record<keyof AditionalInformation, string>>>>({});
  const [formErrors, setFormErrors] = useState<InvoiceErrors>({});
  const [tourism, setTourism] = useState(false);
  const [isTaxBreakdown, setIsTaxBreakdown] = useState(false);
  const [isActiveIce, setIsActiveIce] = useState(false);
  const { status } = useSession();
  const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

  const fetchCreateInvoice = async () => {
    if (status !== "authenticated") return;

    try {
      const data = await getCreateInvoice(axiosAuth);
      const { points, methodOfPayments, pay_method, tourism } = data;
      setInvoice((prev) => ({ ...prev, pay_method }));
      setPoints(points);
      setPayMethods(methodOfPayments);
      setTourism(tourism);
    } catch (error) {
      console.error("Error al cargar: ", error);
    }
  };

  useEffect(() => {
    fetchCreateInvoice();
  }, [status]);

  return (
    <InvoiceCreateContext.Provider value={{
      invoice, selectPoint, selectCustom, payMethods, points, tourism, productInputs, productOutputs, errorProductOutputs, aditionalInformation, errorAditionalInformation, formErrors, isTaxBreakdown, isActiveIce,
      setInvoice, setSelectPoint, setSelectCustom, setProductInputs, setProductOutputs, setErrorProductOutputs, setAditionalInformation, setErrorAditionalInformation, setFormErrors, setIsTaxBreakdown, setIsActiveIce
    }}>
      {children}
    </InvoiceCreateContext.Provider>
  );
};

export const useCreateInvoice = () => {
  const context = useContext(InvoiceCreateContext);
  if (!context) {
    throw new Error("Invoices must be used within an InvoiceCreateProvider");
  }
  return context;
};