import { CarrierProps, Links, Meta } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { initialLinks, initialMeta } from "@/constants";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getCarriers } from "@/services/carrierServices";

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

    const fetchCarrier = useCallback(async (pageUrl: string = 'carriers?page=1&paginate=10') => {
        if (search) {
            pageUrl = `${pageUrl}&search=${search}`;
        }

        const { data } = await getCarriers(axiosAuth, pageUrl);
        if (data) {
            setSuggestions(data.data);
            setMeta(data.meta);
            setLinks(data.links);
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
