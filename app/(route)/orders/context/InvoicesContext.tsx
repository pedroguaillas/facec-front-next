import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { getInvoices } from "../services/invoicesServices";
import { Links, Meta } from "@/types";
import { useSession } from "next-auth/react";
import { OrderProps } from "@/types/order";

interface InvoicesContextType {
  invoices: OrderProps[];
  search: string;
  setSearch: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  meta: Meta | null;
  links: Links | null;
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
  const [links, setLinks] = useState<Links | null>(null);
  const { status } = useSession();
  const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

  const fetchInvoices = async (pageUrl = `orderlist?page=${page}`) => {
    if (status !== "authenticated") return;

    try {
      const data = await getInvoices(axiosAuth, pageUrl, search, page);
      setInvoices(data.data);
      setMeta(data.meta);
      setLinks(data.links);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [status, search, page]);

  return (
    <InvoicesContext.Provider value={{
      invoices, search, setSearch, page, setPage, meta, links,
      fetchInvoices
    }}>
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