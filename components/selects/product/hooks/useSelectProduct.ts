import { useCallback, useEffect, useState } from "react";
import { GeneralPaginate, ProductProps } from "@/types";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

export const useSelectProduct = (label: string = "", index: number, selectProduct: (index: number, product: ProductProps) => void) => {

    const [search, setSearch] = useState(label ?? "");
    const [suggestions, setSuggestions] = useState<ProductProps[]>([]);
    const [skipFetch, setSkipFetch] = useState(false); // 👈 Para evitar fetch al seleccionar
    const axiosAuth = useAxiosAuth();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkipFetch(false); // 👈 habilita búsqueda
        setSearch(event.target.value);
    }

    const handleSelect = (product: ProductProps) => {
        setSearch(product.atts.name);
        setSuggestions([]);
        setSkipFetch(true); // 👈 evita la búsqueda
        selectProduct(index, product);
    }

    const fetchProduct = useCallback(async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<ProductProps>>(`productlist?page=${pageNumber}`, {
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
            // VALIDADO: solo para buscar
            fetchProduct();
        }
    }, [search, skipFetch, fetchProduct]);

    return { search, suggestions, handleSelect, handleChange }
}
