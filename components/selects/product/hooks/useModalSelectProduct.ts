import { initialLinks, initialMeta } from "@/constants/initialValues";
import { Links, Meta, ProductProps } from "@/types";
import { useCallback, useEffect, useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getProducts } from "@/services/productServices";

// type_product: 1 = producto, 2 = servicio
const TYPE_PRODUCT = 1;

export const useModalSelectProduct = (handleSelect: (product: ProductProps) => void, onlyProducts: boolean = false) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<ProductProps[]>([]);
    const axiosAuth = useAxiosAuth();

    const toggle = () => {
        setIsOpen((prev) => {
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

    const fetchProduct = useCallback(
        async (page: string = "page=1") => {
            if (!page) return;

            const pageNumber = page.split("=")[1];
            let pageUrl = `products?page=${pageNumber}&paginate=10`;
            if (search) pageUrl += `&search=${search}`;
            if (onlyProducts) pageUrl += `&type=${TYPE_PRODUCT}`;

            const { data } = await getProducts(axiosAuth, pageUrl);
            if (data) {
                setSuggestions(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
        },
        [search, onlyProducts, axiosAuth],
    );

    // handleSelectLocal es necesario porque toca resetear los valores iniciales
    const handleSelectLocal = (product: ProductProps) => {
        handleSelect(product);
        toggle();
    };

    useEffect(() => {
        // VALIDADO: Solo cuando se abre el modal
        if (isOpen) {
            fetchProduct();
        }
    }, [isOpen, fetchProduct]);

    return { isOpen, search, meta, links, suggestions, setSearch, toggle, fetchProduct, handleSelectLocal };
};
