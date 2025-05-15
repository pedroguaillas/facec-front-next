import { CarrierProps, GeneralPaginate, Links, Meta } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { initialLinks, initialMeta } from "@/constants";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

export const useModalSelectCarrier = (handleSelect: (carrier: CarrierProps) => void) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<CarrierProps[]>([]);
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

    const fetchCarrier = useCallback(async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split('=')[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<CarrierProps>>(`carrierlist?page=${pageNumber}`, {
                search,
                paginate: 10
            })
            const { data, meta, links } = res.data;
            setSuggestions(data);
            setMeta(meta);
            setLinks(links);
        } catch (error) {
            console.error(error);
        }
    }, [search, axiosAuth])

    const handleSelectLocal = (carrier: CarrierProps) => {
        handleSelect(carrier);
        toggle();
    }

    useEffect(() => {
        if (isOpen) {
            fetchCarrier();
        }
    }, [isOpen, fetchCarrier])

    return { isOpen, search, meta, links, suggestions, toggle, setSearch, fetchCarrier, handleSelectLocal }
}
