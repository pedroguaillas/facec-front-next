import { CustomerProps, GeneralPaginate, Links, Meta, SupplierProps } from "@/types";
import { initialLinks, initialMeta } from "@/constants/initialValues";
import { useCallback, useEffect, useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

export const useModalSelectProvider = (handleSelect: (provider: SupplierProps) => void) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<SupplierProps[]>([]);
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

    const fetchProvider = useCallback(async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<CustomerProps>>(`providerlist?page=${pageNumber}`, {
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

    const handleSelectLocal = (provider: SupplierProps) => {
        handleSelect(provider);
        toggle();
    }

    useEffect(() => {
        if (isOpen) fetchProvider();
    }, [isOpen, fetchProvider]);

    return { isOpen, search, meta, links, suggestions, toggle, setSearch, fetchProvider, handleSelectLocal }
}
