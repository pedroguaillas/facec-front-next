import { useModalSelectProduct } from "./hooks/useModalSelectProduct";
import { Modal, TableResponsive, Paginate } from "@/components";
import { FaSearch } from "react-icons/fa";
import { ProductProps } from "@/types";

interface Props {
    handleSelect: (product: ProductProps) => void;
}

const ModalSelectProduct = ({ handleSelect }: Props) => {

    const { isOpen, search, meta, links, suggestions, setSearch, toggle, fetchProduct, handleSelectLocal } = useModalSelectProduct(handleSelect);

    const ProductsPagination = () => {

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchProduct(pageUrl);
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    return (
        <>
            <button onClick={toggle} aria-label="Seleccionar producto" className='rounded-r p-2 bg-primary text-white cursor-pointer'>
                <FaSearch />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Seleccionar producto"
                modalSize="lg"
            >
                <input
                    type="search"
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-2 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="hidden sm:block">#</th>
                            <th>Código</th>
                            <th className="text-left">Producto/Servicio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suggestions.map((product, indexItem) => (
                            <tr
                                key={product.id}
                                onClick={() => handleSelectLocal(product)}
                                className={`hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
                                ${indexItem % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}`}
                            >
                                <td className="hidden sm:block">{indexItem + 1}</td>
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
        </>
    );
}

export default ModalSelectProduct;
