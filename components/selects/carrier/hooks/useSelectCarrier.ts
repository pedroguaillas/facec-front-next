import { useCallback, useEffect, useState } from "react";
import { CarrierProps } from "@/types";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getCarriers } from "@/services/carrierServices";

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

    const fetchCarrier = useCallback(async (pageUrl: string = `carriers?page=1&paginate=5`) => {
        if (search) {
            pageUrl = `${pageUrl}&search=${search}`;
        }
        const { data } = await getCarriers(axiosAuth, pageUrl);
        if (data) {
            setSuggestions(data.data);
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
