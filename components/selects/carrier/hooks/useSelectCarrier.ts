import { useCallback, useEffect, useState } from "react";
import { CarrierProps, GeneralPaginate } from "@/types";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

export const useSelectCarrier = (label: string = "", selectCarrier: (carrier: CarrierProps) => void) => {
    
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<CarrierProps[]>([]);
    const [skipFetch, setSkipFetch] = useState(false);
    const axiosAuth = useAxiosAuth();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkipFetch(false);
        setSearch(event.target.value);
    }

    const handleSelect = (carrier: CarrierProps) => {
        setSearch(carrier.atts.name);
        setSuggestions([]);
        setSkipFetch(true);
        selectCarrier(carrier);
    }

    const fetchCarrier = useCallback(async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<CarrierProps>>(`carrierlist?page=${pageNumber}`, {
                search,
                paginate: 5,
            });
            const { data } = res.data;
            setSuggestions(data);
        } catch (error) {
            console.error(error);
        }
    }, [search, axiosAuth]);

    useEffect(() => {
        if (search.length > 1 && !skipFetch) {
            fetchCarrier();
        }
    }, [search, skipFetch, fetchCarrier]);

    useEffect(() => {
        if (label) {
            setSearch(label);
            setSkipFetch(true);
        }
    }, [label]);

    return { search, suggestions, handleChange, handleSelect }
}
