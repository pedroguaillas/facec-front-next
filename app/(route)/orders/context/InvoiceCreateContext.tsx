"use client";

import { createContext, useState, useContext, useEffect, ReactNode, SetStateAction, Dispatch } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { getCreateInvoice } from "../services/invoicesServices";
import { useSession } from "next-auth/react";

interface InvoicesContextType {
  invoice: OrderCreateProps;
  setInvoice: Dispatch<SetStateAction<OrderCreateProps>>; // Exposed for manual fetch
  payMethods: PayMethod[];
  points: EmisionPoint[];
  tourism: boolean;
  productInputs: ProductInput[];
  productOutputs: ProductOutput[];
  aditionalInformation: AditionalInformation[];
  setProductInputs: Dispatch<SetStateAction<ProductInput[]>>;
  setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
  setAditionalInformation: Dispatch<SetStateAction<AditionalInformation[]>>;
}

const InvoiceCreateContext = createContext<InvoicesContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}
const dateType = new Date();
dateType.setHours(dateType.getHours() - 5);
const date = dateType.toISOString().substring(0, 10);

const initialInvoice = {
  serie: 'Cree un punto de emisión',
  date,
  expiration_days: 0,
  no_iva: 0,
  base0: 0,
  base5: 0,
  base12: 0,
  base15: 0,
  iva: 0,
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
  guia: '',
};

const initialProductOutputs = [
  {
    id: Date.now(),
    product_id: 0,
    price: 0,
    quantity: 1,
    stock: 1,
    discount: 0,
    iva: 0,
    total_iva: 0,
    ice: undefined,
    percentage: 0
  }
];

export const InvoiceCreateProvider = ({ children }: Props) => {
  const [invoice, setInvoice] = useState<OrderCreateProps>(initialInvoice);
  const [productInputs, setProductInputs] = useState<ProductInput[]>([]);
  const [productOutputs, setProductOutputs] = useState<ProductOutput[]>(initialProductOutputs);
  const [payMethods, setPayMethods] = useState<PayMethod[]>([]);
  const [points, setPoints] = useState<EmisionPoint[]>([]);
  const [aditionalInformation, setAditionalInformation] = useState<AditionalInformation[]>([]);
  const [tourism, setTourism] = useState(false);
  const { status } = useSession();
  const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

  const fetchCreateInvoice = async () => {
    if (status !== "authenticated") return;

    try {
      const data = await getCreateInvoice(axiosAuth);
      const { points, methodOfPayments, pay_method, tourism } = data;
      setPoints(points);
      setPayMethods(methodOfPayments);
      setInvoice((prev) => ({ ...prev, pay_method }));
      setTourism(tourism);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
    }
  };

  useEffect(() => {
    fetchCreateInvoice();
  }, [status]);

  return (
    <InvoiceCreateContext.Provider value={{ invoice, setInvoice, payMethods, points, tourism, productInputs, productOutputs, aditionalInformation, setProductInputs, setProductOutputs, setAditionalInformation }}>
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