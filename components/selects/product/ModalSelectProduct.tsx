import { TableResponsive } from "@/components/table-responsive/TableResponsive";
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useEffect, useState } from "react";
import { GeneralPaginate } from "@/types";

interface Props {
    show: boolean;
    handleSelect: (product: ProductPaginate) => void;
    onClose: () => void; // Nuevo
}

const ModalSelectProduct = ({ show, handleSelect, onClose }: Props) => {

    const [search, setSearch] = useState("");
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
            const { data } = res.data;
            setSuggestions(data);
        } catch (error) {
            console.error(error);
        }
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
        <>

            <dialog open={show} className="modal modal-open bg-white rounded-lg shadow-xl p-4 max-w-3xl">
                <div className="relative">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Seleccionar producto</h2>
                    <button onClick={onClose} className="absolute top-2 right-4 text-lg font-bold text-gray-600 hover:text-red-500">✕</button>

                    <input
                        type="search"
                        placeholder="Buscar producto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full mb-4 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {/* Tabla */}
                    <TableResponsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Código</th>
                                <th>Producto/Servicio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map((product, indexItem) => (
                                <tr
                                    key={indexItem}
                                    onClick={() => handleSelect(product)}
                                    className="hover:bg-gray-100 cursor-pointer"
                                >
                                    <td>{indexItem + 1}</td>
                                    <td>{product.atts.code}</td>
                                    <td className="text-left">{product.atts.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </TableResponsive>
                </div>
            </dialog>
        </>
    )
}

export default ModalSelectProduct;
