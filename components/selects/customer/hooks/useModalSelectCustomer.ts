import { initialLinks, initialMeta } from "@/constants/initialValues";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { CustomerProps, GeneralPaginate, Links, Meta } from "@/types";
import { useCallback, useEffect, useState } from "react";

export const useModalSelectCustomer = (handleSelect: (custom: CustomerProps) => void) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<CustomerProps[]>([]);
    const axiosAuth = useAxiosAuth();

    const toggle = () => {
        setIsOpen(prev => {
            const next = !prev;
            if (!next) {
                setSearch("");
                setSuggestions([]);
                setMeta({ ...initialMeta });
                setLinks({ ...initialLinks });
            }
            return next;
        });
    }

    const fetchCustomer = useCallback(async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<CustomerProps>>(`customerlist?page=${pageNumber}`, {
                search,
                paginate: 10,
            });
            const { data, meta, links } = res.data;
            setSuggestions(data);
            setMeta(meta);
            setLinks(links);
        } catch (error) {
            console.error(error);
        }
    }, [search, axiosAuth]);

    const handleSelectLocal = (custom: CustomerProps) => {
        handleSelect(custom);
        toggle();
    }

    useEffect(() => {
        if (isOpen) {
            // VALIDADO: que no ejecuete en bucle
            fetchCustomer()
        }
    }, [isOpen, fetchCustomer]);

    return { isOpen, search, meta, links, suggestions, toggle, setSearch, fetchCustomer, handleSelectLocal }
}
