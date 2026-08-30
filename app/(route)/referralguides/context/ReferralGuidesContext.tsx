import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getReferralGuides } from "../services/referralGuidesServices";
import { Links, Meta, ReferralGuideProps } from "@/types"
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { isPendingVoucherState } from "@/helpers/voucherPolling";

interface ReferralGuidesContextType {
    referralGuides: ReferralGuideProps[],
    page: number,
    meta: Meta | null,
    links: Links | null,
    setPage: (value: number) => void,
    fetchReferralGuides: (pageUrl?: string) => Promise<void>;
}

const ReferralGuideContext = createContext<ReferralGuidesContextType | undefined>(undefined);

interface Props {
    children: ReactNode,
}

export const ReferralGuidesProvider = ({ children }: Props) => {

    const [referralGuides, setReferralGuides] = useState<ReferralGuideProps[]>([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    const fetchReferralGuides = useCallback(async (pageUrl = `referralguides?page=${page}`) => {
        if (status !== "authenticated") return;

        const { data } = await getReferralGuides(axiosAuth, pageUrl);
        if (data) {
            setReferralGuides(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        }
    }, [status, axiosAuth, page]); // Dependencias correctas

    useEffect(() => {
        fetchReferralGuides();
    }, [fetchReferralGuides]);

    useEffect(() => {
        const hasPending = referralGuides.some((referralGuide) => isPendingVoucherState(referralGuide.atts.state));
        if (!hasPending) return;

        const interval = setInterval(() => {
            fetchReferralGuides();
        }, 3000);

        return () => clearInterval(interval);
    }, [referralGuides, fetchReferralGuides]);

    return (
        <ReferralGuideContext.Provider value={{
            referralGuides, page, meta, links,
            fetchReferralGuides, setPage,
        }}>
            {children}
        </ReferralGuideContext.Provider>
    )
}

export const useReferralGuides = () => {
    const context = useContext(ReferralGuideContext);
    if (!context) {
        throw new Error("useReferralGuides must be used within an ReferralGuidesProvider");
    }
    return context;
}
