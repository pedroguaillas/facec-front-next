import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";
import { getInvoices } from "../services/invoicesServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { useSession } from "next-auth/react";
import { OrderProps } from "@/types/order";
import { Links, Meta } from "@/types";
import { isPendingVoucherState } from "@/helpers/voucherPolling";

interface InvoicesContextType {
    invoices: OrderProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
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

    const fetchInvoices = useCallback(
        async (pageUrl: string = `orders?page=${page}`) => {
            if (status !== "authenticated") return;

            if (search) {
                pageUrl = `${pageUrl}&search=${search}`;
            }

            const { data } = await getInvoices(axiosAuth, pageUrl);
            if (data) {
                setInvoices(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
        },
        [status, axiosAuth, search, page],
    );

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    useEffect(() => {
        const hasPending = invoices.some((invoice) => isPendingVoucherState(invoice.atts.state));
        if (!hasPending) return;

        const interval = setInterval(() => {
            fetchInvoices();
        }, 3000);

        return () => clearInterval(interval);
    }, [invoices, fetchInvoices]);

    return (
        <InvoicesContext.Provider
            value={{
                invoices, search, page, meta, links,
                fetchInvoices, setSearch, setPage,
            }}
        >
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
