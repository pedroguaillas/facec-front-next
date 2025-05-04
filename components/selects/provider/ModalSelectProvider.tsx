import { useModalSelectProvider } from "./hooks/useModalSelectProvider";
import { Modal, TableResponsive, Paginate } from "@/components";
import { FaSearch } from "react-icons/fa";
import { SupplierProps } from "@/types";

interface Props {
    handleSelect: (provider: SupplierProps) => void;
}

export const ModalSelectProvider = ({ handleSelect }: Props) => {

    const { isOpen, search, meta, links, suggestions, toggle, setSearch, fetchProvider, handleSelectLocal } = useModalSelectProvider(handleSelect);

    const CustomPagination = () => {

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchProvider(pageUrl);
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    return (
        <>
            <span onClick={toggle} className='rounded-r p-2 bg-primary text-white cursor-pointer'>
                <FaSearch />
            </span>

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Seleccionar proveedor"
                modalSize="lg"
            >
                <input
                    type="search"
                    placeholder="Buscar proveedor ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-2 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="hidden sm:block">#</th>
                            <th>Identificación</th>
                            <th className="text-left">Razon social</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suggestions.map((provider, indexItem) => (
                            <tr
                                key={provider.id}
                                onClick={() => handleSelectLocal(provider)}
                                className={`hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
                                ${indexItem % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}`}
                            >
                                <td className="hidden sm:block">{indexItem + 1}</td>
                                <td>{provider.atts.identication}</td>
                                <td className="text-left">{provider.atts.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </TableResponsive>

                <div className="flex justify-center">
                    <CustomPagination />
                </div>
            </Modal>
        </>
    );
}

export default ModalSelectProvider;
