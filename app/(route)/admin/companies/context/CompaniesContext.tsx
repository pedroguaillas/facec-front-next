"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getCompanies } from "../services/companiesServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Company, CompanyActivityStatus, Links, Meta } from "@/types";
import { useSession } from "next-auth/react";

interface CompanyContextType {
    companies: Company[],
    search: string,
    activity: CompanyActivityStatus | '',
    setActivity: (value: CompanyActivityStatus | '') => void,
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
    // Filtro por uso de la cuenta; vacío = todas
    const [activity, setActivity] = useState<CompanyActivityStatus | ''>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    // Solo vale la respuesta de la última petición (al cambiar el filtro puede llegar antes una vieja)
    const lastRequest = useRef(0);

    const fetchCompanies = useCallback(async (pageUrl?: string) => {
        if (status !== "authenticated") return;
        const request = ++lastRequest.current;
        console.log("useCallback, fetchCompanies")

        try {
            let url = pageUrl || `admin/companies?page=${page}`;

            if (search) {
                url = `${url}&search=${search}`;
            }
            if (activity && !url.includes('activity=')) {
                url = `${url}&activity=${activity}`;
            }

            const response = await getCompanies(axiosAuth, url);
            if (response && request === lastRequest.current) {
                setCompanies(response.data);
                setMeta(response.meta);
                setLinks(response.links);
            }
        } catch (error) {
            console.log("Error al obtener las companias: ", error)
        }
    }, [status, axiosAuth, search, activity, page]);

    // Al cambiar el filtro se vuelve a la primera página
    const changeActivity = useCallback((value: CompanyActivityStatus | '') => {
        setActivity(value);
        setPage(1);
    }, []);

    // Filtro inicial desde el dashboard (?activity=risk)
    useEffect(() => {
        const initial = new URLSearchParams(window.location.search).get('activity');
        if (initial && initial in { active: 1, risk: 1, inactive: 1, never: 1 }) setActivity(initial as CompanyActivityStatus);
    }, []);

    useEffect(() => {
        fetchCompanies();
        console.log("useEffect, fetchCompanies")
    }, [fetchCompanies]);

    return (
        <CompaniesContext.Provider value={{
            companies, search, activity, page, meta, links, setActivity: changeActivity,
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