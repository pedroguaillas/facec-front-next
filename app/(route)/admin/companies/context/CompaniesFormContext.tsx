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
    economic_activity: '',
    accounting: false,
    micro_business: false,
    rimpe: 0,
    retention_agent: null,
    phone: null,
    logo_dir: null,
    cert_dir: null,
    sign_valid_from: null,
    sign_valid_to: null,
    enviroment_type: 1,
    active: true,
    active_voucher: true,
    decimal: 2,
    expired: null,
    pay_method: 0,
    base5: false,
    base8: false,
    tourism_from: null,
    tourism_to: null,
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

        const { data, error } = await getCompanyEdit(axiosAuth, id);

        if (data) {
            setCompany({ ...data, id: `${data.id}` });
        } else if (error === CodeErrors.NETWORK_ERROR) {
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