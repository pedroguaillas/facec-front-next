import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";
import { getInvoices } from "../services/invoicesServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { useSession } from "next-auth/react";
import { OrderProps } from "@/types/order";
import { Links, Meta } from "@/types";
import { isPendingVoucherState } from "@/helpers/voucherPolling";
import { ORDER_SERIE_PREFIX } from "@/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface InvoicesContextType {
    invoices: OrderProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    // Filtro por estado SRI que viene en la URL (?state=), ej. desde el dashboard
    stateFilter: string | null;
    dateFrom: string | null;
    clearStateFilter: () => void;
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const stateFilter = searchParams.get('state');
    // Ventana del dashboard (últimos 30 días)
    const dateFrom = searchParams.get('date_from');

    const clearStateFilter = useCallback(() => router.replace(pathname), [router, pathname]);

    const fetchInvoices = useCallback(
        async (pageUrl: string = `orders?page=${page}`) => {
            if (status !== "authenticated") return;

            if (search) {
                pageUrl = `${pageUrl}&search=${search}`;
            }
            if (stateFilter && !pageUrl.includes('state=')) {
                pageUrl = `${pageUrl}&state=${encodeURIComponent(stateFilter)}`;
            }
            if (dateFrom && !pageUrl.includes('date_from=')) {
                pageUrl = `${pageUrl}&date_from=${dateFrom}`;
            }

            const { data } = await getInvoices(axiosAuth, pageUrl);
            if (data) {
                setInvoices(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
        },
        [status, axiosAuth, search, page, stateFilter, dateFrom],
    );

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    useEffect(() => {
        const hasPending = invoices.some((invoice) => {
            const seriePrefix = invoice.atts.serie?.trim().split(" ")[0] ?? "";
            const isElectronic = seriePrefix === ORDER_SERIE_PREFIX.FACTURA || seriePrefix === ORDER_SERIE_PREFIX.NOTA_CREDITO;
            return isPendingVoucherState(invoice.atts.state, isElectronic);
        });
        if (!hasPending) return;

        const interval = setInterval(() => {
            fetchInvoices();
        }, 3000);

        return () => clearInterval(interval);
    }, [invoices, fetchInvoices]);

    return (
        <InvoicesContext.Provider
            value={{
                invoices, search, page, meta, links, stateFilter, dateFrom,
                fetchInvoices, setSearch, setPage, clearStateFilter,
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
