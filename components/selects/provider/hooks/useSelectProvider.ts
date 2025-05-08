import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { GeneralPaginate, SupplierProps } from "@/types";
import { useCallback, useEffect, useState } from "react";

export const useSelectProvider = (label: string = "", selectProvider: (provider: SupplierProps) => void) => {

    const [search, setSearch] = useState(label ?? "");
    const [suggestions, setSuggestions] = useState<SupplierProps[]>([]);
    const [skipFetch, setSkipFetch] = useState(false); // 👈 Para evitar fetch al seleccionar
    const axiosAuth = useAxiosAuth();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkipFetch(false); // 👈 habilita búsqueda
        setSearch(event.target.value);
    }

    const handleSelect = (provider: SupplierProps) => {
        setSearch(provider.atts.name);
        setSuggestions([]);
        setSkipFetch(true); // 👈 evita la búsqueda
        selectProvider(provider);
    }

    const fetchProvider = useCallback(async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<SupplierProps>>(`providerlist?page=${pageNumber}`, {
                search,
                paginate: 5,
            });
            const { data } = res.data;
            setSuggestions(data);
        } catch (error) {
            console.error(error);
        }
    }, [search, axiosAuth]);

    // 🔁 Escuchar cambios externos en label
    useEffect(() => {
        setSearch(label);
        setSkipFetch(true); // evitar búsqueda inmediata tras actualizar externamente
    }, [label]);

    // 🔁 Buscar proveedores al escribir
    useEffect(() => {
        if (search.length > 1 && !skipFetch) {
            fetchProvider();
        }
    }, [search, skipFetch, fetchProvider]);

    return { search, suggestions, handleChange, handleSelect }
}
