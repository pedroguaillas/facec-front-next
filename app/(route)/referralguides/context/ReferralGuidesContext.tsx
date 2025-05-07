import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getReferralGuides } from "../services/referralGuidesServices";
import { Links, Meta, ReferralGuideProps } from "@/types"
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";

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
        console.log('useCallback, fetchReferralGuides')

        try {
            const data = await getReferralGuides(axiosAuth, pageUrl, page);
            setReferralGuides(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        } catch (error) {
            console.error("Error al obtener guias de remisión: ", error);
        }
    }, [status, axiosAuth, page]); // Dependencias correctas

    useEffect(() => {
        console.log('useEffect, start')
        fetchReferralGuides();
    }, [fetchReferralGuides]);

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
