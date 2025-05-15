"use client";

import { createContext, useState, useContext, useEffect, ReactNode, SetStateAction, Dispatch } from "react";
import { AditionalInformation, OrderCreateProps, PayMethod, ProductOutput } from "@/types/order";
import { getCreateInvoice, getInvoice } from "../services/invoiceServices";
import { initialProductItem } from "@/constants/initialValues";
import { CustomerProps, EmisionPoint } from "@/types";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { getDate } from "@/helpers/dateHelper";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";

interface InvoicesContextType {
  invoice: OrderCreateProps;
  payMethods: PayMethod[];
  points: EmisionPoint[];
  selectPoint: EmisionPoint | null;
  selectCustom: CustomerProps | null;
  tourism: boolean;
  productOutputs: ProductOutput[];
  errorProductOutputs: Record<string, Partial<Record<keyof ProductOutput, string>>>;
  aditionalInformation: AditionalInformation[];
  errorAditionalInformation: Record<string, Partial<Record<keyof AditionalInformation, string>>>;
  formErrors: Partial<Record<keyof OrderCreateProps, string>>;
  isTaxBreakdown: boolean;
  isActiveIce: boolean;
  setInvoice: Dispatch<SetStateAction<OrderCreateProps>>; // Exposed for manual fetch
  setSelectPoint: Dispatch<SetStateAction<EmisionPoint | null>>;
  setSelectCustom: Dispatch<SetStateAction<CustomerProps | null>>;
  setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
  setErrorProductOutputs: Dispatch<SetStateAction<Record<string, Partial<Record<keyof ProductOutput, string>>>>>;
  setAditionalInformation: Dispatch<SetStateAction<AditionalInformation[]>>;
  setErrorAditionalInformation: Dispatch<SetStateAction<Record<string, Partial<Record<keyof AditionalInformation, string>>>>>;
  setFormErrors: Dispatch<SetStateAction<Partial<Record<keyof OrderCreateProps, string>>>>;
  setIsTaxBreakdown: Dispatch<SetStateAction<boolean>>;
  setIsActiveIce: Dispatch<SetStateAction<boolean>>;
}

const FormInvoiceContext = createContext<InvoicesContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const initialInvoice: OrderCreateProps = {
  serie: 'Cree un punto de emisión',
  date: getDate(),
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

export const FormInvoiceProvider = ({ children }: Props) => {
  const [invoice, setInvoice] = useState<OrderCreateProps>(initialInvoice);
  const [selectPoint, setSelectPoint] = useState<EmisionPoint | null>(null);
  const [selectCustom, setSelectCustom] = useState<CustomerProps | null>(null);
  const [productOutputs, setProductOutputs] = useState<ProductOutput[]>([]);
  const [errorProductOutputs, setErrorProductOutputs] = useState<Record<string, Partial<Record<keyof ProductOutput, string>>>>({});
  const [payMethods, setPayMethods] = useState<PayMethod[]>([]);
  const [points, setPoints] = useState<EmisionPoint[]>([]);
  const [aditionalInformation, setAditionalInformation] = useState<AditionalInformation[]>([]);
  const [errorAditionalInformation, setErrorAditionalInformation] = useState<Record<string, Partial<Record<keyof AditionalInformation, string>>>>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof OrderCreateProps, string>>>({});
  const [tourism, setTourism] = useState(false);
  const [isTaxBreakdown, setIsTaxBreakdown] = useState(false);
  const [isActiveIce, setIsActiveIce] = useState(false);
  const { status } = useSession();
  const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente
  const params = useParams();

  useEffect(() => {
    const fetchEditInvoice = async () => {
      if (status !== "authenticated") return;

      try {
        if (typeof params?.id === 'string') {
          const data = await getInvoice(axiosAuth, params.id as string);
          const { customers, methodOfPayments, order, order_aditionals, order_items, points } = data;
          setInvoice({ ...order, id: order.id + '' });
          setPoints(points);
          setPayMethods(methodOfPayments);
          setSelectCustom(customers[0]);
          setAditionalInformation(order_aditionals.map((item: AditionalInformation) => ({ ...item, id: item.id + '' })));
          setProductOutputs(order_items.map((item: ProductOutput) => ({ ...item, id: item.id + '' })));
          setIsActiveIce(order_items.some((item: ProductOutput) => item.ice !== undefined));
        } else {
          const data = await getCreateInvoice(axiosAuth);
          const { points, methodOfPayments, pay_method, tourism } = data;
          setInvoice((prev) => ({ ...prev, pay_method }));
          setPoints(points);
          setPayMethods(methodOfPayments);
          setTourism(tourism);
          setProductOutputs([{ ...initialProductItem, id: nanoid(), }]);
        }
      } catch (error) {
        console.error("Error al cargar: ", error);
      }
    }
    fetchEditInvoice();
  }, [status, axiosAuth, params?.id]);

  return (
    <FormInvoiceContext.Provider value={{
      invoice, selectPoint, selectCustom, payMethods, points, tourism, productOutputs, errorProductOutputs, aditionalInformation, errorAditionalInformation, formErrors, isTaxBreakdown, isActiveIce,
      setInvoice, setSelectPoint, setSelectCustom, setProductOutputs, setErrorProductOutputs, setAditionalInformation, setErrorAditionalInformation, setFormErrors, setIsTaxBreakdown, setIsActiveIce
    }}>
      {children}
    </FormInvoiceContext.Provider>
  );
};

export const useFormInvoice = () => {
  const context = useContext(FormInvoiceContext);
  if (!context) {
    throw new Error("FormInvoice must be used within an FormInvoiceProvider");
  }
  return context;
};