import { CustomerProps, GeneralPaginate } from "@/types";
import { useCallback, useEffect, useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

export const useSelectCustomer = (label: string = "", selectCustomer: (customer: CustomerProps) => void) => {
    const [search, setSearch] = useState(label ?? "");
    const [suggestions, setSuggestions] = useState<CustomerProps[]>([]);
    const [skipFetch, setSkipFetch] = useState(false); // 👈 Para evitar fetch al seleccionar un Cliente
    const axiosAuth = useAxiosAuth();

    // Inicia con la busqueda de las sugerencias
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkipFetch(false); // 👈 habilita búsqueda
        setSearch(event.target.value);
    };

    // Termina con la selección de un cliente, ya sea de la sugerencia, creado desde el modal o seleccionado desde el modal
    const handleSelect = (customer: CustomerProps) => {
        setSearch(customer.atts.name);
        setSuggestions([]);
        setSkipFetch(true); // 👈 evita la búsqueda
        selectCustomer(customer);
    };

    const fetchCustomer = useCallback(
        async (page: string = "page=1") => {
            if (!page) return;

            const pageNumber = page.split("=")[1];
            try {
                const res = await axiosAuth.get<GeneralPaginate<CustomerProps>>(`customers?page=${pageNumber}`, {
                    params: { search, paginate: 5 },
                });
                const { data } = res.data;
                setSuggestions(data);
            } catch (error) {
                console.error(error);
            }
        },
        [search, axiosAuth],
    );

    useEffect(() => {
        if (search.length > 1 && !skipFetch) {
            // VALIDADO: Solo para mostrar sugerencias
            fetchCustomer();
        }
    }, [search, skipFetch, fetchCustomer]);

    // Update search when label changes
    // Used for load edit invoice
    useEffect(() => {
        if (label) {
            setSearch(label);
            setSkipFetch(true); // Prevent immediate fetch when label changes
        }
    }, [label]);

    return { search, suggestions, handleChange, handleSelect };
};
