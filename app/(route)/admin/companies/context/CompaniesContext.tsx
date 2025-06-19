"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getCompanies } from "../services/companiesServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Company, Links, Meta } from "@/types";
import { useSession } from "next-auth/react";

interface CompanyContextType {
    companies: Company[],
    search: string,
    page: number,
    meta: Meta | null,
    links: Links | null,
    setSearch: (value: string) => void,
    setPage: (value: number) => void,
    fetchCompanies: (pageUrl?: string) => Promise<void>,
}

const CompaniesContext = createContext<CompanyContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const CompaniesProvider = ({ children }: Props) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchCompanies = useCallback(async (pageUrl?: string) => {
        if (status !== "authenticated") return;
        console.log("useCallback, fetchCompanies")

        try {
            let url = pageUrl || `admin/companies?page=${page}`;

            if (search) {
                url = `${url}&search=${search}`;
            }

            const response = await getCompanies(axiosAuth, url);
            if (response) {
                setCompanies(response.data);
                setMeta(response.meta);
                setLinks(response.links);
            }
        } catch (error) {
            console.log("Error al obtener las companias: ", error)
        }
    }, [status, axiosAuth, search, page]);

    useEffect(() => {
        fetchCompanies();
        console.log("useEffect, fetchCompanies")
    }, [fetchCompanies]);

    return (
        <CompaniesContext.Provider value={{
            companies, search, page, meta, links,
            fetchCompanies, setSearch, setPage
        }}>
            {children}
        </CompaniesContext.Provider>
    );
}

export const useCompanies = () => {
    const context = useContext(CompaniesContext);
    if (!context) {
        throw new Error("useCompanies must be used within a CompaniesProvider");
    }

    return context;
}