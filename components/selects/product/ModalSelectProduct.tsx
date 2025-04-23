import { Modal, TableResponsive, Paginate } from "@/components";
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useEffect, useState } from "react";
import { GeneralPaginate, Links, Meta } from "@/types";
import { initialLinks, initialMeta } from "@/constants/initialValues";

interface Props {
    show: boolean;
    handleSelect: (product: ProductPaginate) => void;
    onClose: () => void; // Nuevo
}

const ModalSelectProduct = ({ show, handleSelect, onClose }: Props) => {

    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<ProductPaginate[]>([]);
    const axiosAuth = useAxiosAuth();

    const fetchProduct = async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<ProductPaginate>>(`productlist?page=${pageNumber}`, {
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
    };

    const ProductsPagination = () => {

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchProduct(pageUrl);
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchProduct();
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        if (show) fetchProduct();
    }, [show]);

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title="Seleccionar producto"
            modalSize="lg"
        >
            <input
                type="search"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <TableResponsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Código</th>
                        <th className="text-left">Producto/Servicio</th>
                    </tr>
                </thead>
                <tbody>
                    {suggestions.map((product, indexItem) => (
                        <tr
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            className="hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                            <td>{indexItem + 1}</td>
                            <td>{product.atts.code}</td>
                            <td className="text-left">{product.atts.name}</td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>

            <div className="flex justify-center">
                <ProductsPagination />
            </div>
        </Modal>
    );
}

export default ModalSelectProduct;
