import { initialLinks, initialMeta } from '@/constants/initialValues';
import { GeneralPaginate, Links, Meta, ProductProps } from '@/types';
import { useCallback, useEffect, useState } from 'react'
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';

export const useModalSelectProduct = (handleSelect: (product: ProductProps) => void) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<ProductProps[]>([]);
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
    };

    const fetchProduct = useCallback(async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<ProductProps>>(`productlist?page=${pageNumber}`, {
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

    // handleSelectLocal es necesario porque toca resetear los valores iniciales
    const handleSelectLocal = (product: ProductProps) => {
        handleSelect(product);
        toggle();
    }

    useEffect(() => {
        // VALIDADO: Solo cuando se abre el modal
        if (isOpen) {
            fetchProduct();
        }
    }, [isOpen, fetchProduct]);

    return { isOpen, search, meta, links, suggestions, setSearch, toggle, fetchProduct, handleSelectLocal }
}
