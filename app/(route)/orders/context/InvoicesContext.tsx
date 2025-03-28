import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { getInvoices } from "../services/invoicesServices";
import { Meta } from "@/types";
import { useSession } from "next-auth/react";

interface InvoicesContextType {
  invoices: OrderProps[];
  search: string;
  setSearch: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  meta: Meta | null;
  fetchInvoices: (pageUrl?: string) => Promise<void>; // Exposed for manual fetches
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const InvoicesProvider = ({ children }: Props) => {
  const [invoices, setInvoices] = useState<OrderProps[]>([]);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta | null>(null);
  const { status } = useSession();
  const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

  const fetchInvoices = async (pageUrl = `orderlist?page=${page}`) => {
    if (status !== "authenticated") return;

    try {
      const data = await getInvoices(axiosAuth, pageUrl, search, page);
      setInvoices(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [status, search, page]);

  return (
    <InvoicesContext.Provider value={{ invoices, search, setSearch, page, setPage, meta, fetchInvoices }}>
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (!context) {
    throw new Error("useInvoices must be used within an InvoicesProvider");
  }
  return context;
};