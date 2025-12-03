"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { getCompanyEdit } from "../services/companiesServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Company } from "@/types";
import { useSession } from "next-auth/react";
import { CodeErrors } from "@/constants/codeErrors";
import { redirect } from "next/navigation";

interface CompanyContextType {
    company: Company,
    setCompany: Dispatch<SetStateAction<Company>>,
}

const CompaniesFormContext = createContext<CompanyContextType | undefined>(undefined);

interface Props {
    id: string;
    children: ReactNode;
}

const initialCompany: Company = {
    id: '',
    ruc: '',
    company: '',
    accounting: false,
    rimpe: 0,
    retention_agent: 0,
    sign_valid_to: new Date(),
    pay_method: 0,
    base5: false,
    base8: false,
    ice: false,
    inventory: false,
    printf: false,
    guia_in_invoice: false,
    import_in_invoice: false,
    import_in_invoices: false,

    // Servicio de transporte:
    transport: false,
    repayment: false,
}

export const CompaniesFormProvider = ({ id, children }: Props) => {
    const [company, setCompany] = useState<Company>(initialCompany);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchCompany = useCallback(async () => {
        if (status !== "authenticated") return;

        const { data, message } = await getCompanyEdit(axiosAuth, id);

        if (data) {
            setCompany(data);
        } else if (message === CodeErrors.NETWORK_ERROR) {
            redirect(`/error?message=${encodeURIComponent(CodeErrors.NETWORK_ERROR_MESSAGE)}`);
        }
        
    }, [status, axiosAuth, id]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    return (
        <CompaniesFormContext.Provider value={{
            company, setCompany
        }}>
            {children}
        </CompaniesFormContext.Provider>
    );
}

export const useCompanyForm = () => {
    const context = useContext(CompaniesFormContext);
    if (!context) {
        throw new Error("useCompanies must be used within a CompaniesProvider");
    }

    return context;
}