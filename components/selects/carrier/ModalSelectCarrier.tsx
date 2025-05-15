import { CarrierProps } from "@/types";
import { useModalSelectCarrier } from "./hooks/useModalSelectCarrier";
import { Modal, Paginate, TableResponsive } from "@/components";
import { FaSearch } from "react-icons/fa";

interface Props {
    handleSelect: (carrier: CarrierProps) => void;
}

export const ModalSelectCarrier = ({ handleSelect }: Props) => {
    const { isOpen, search, meta, links, suggestions, toggle, setSearch, fetchCarrier, handleSelectLocal } = useModalSelectCarrier(handleSelect);

    const CustomPagination = () => {
        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchCarrier(pageUrl);
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    return (
        <>
            <span onClick={toggle} className='p-2 bg-primary text-white cursor-pointer'>
                <FaSearch />
            </span>

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Seleccionar transportista"
                modalSize="lg"
            >
                <input
                    type="search"
                    placeholder="Buscar transportista..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-2 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <TableResponsive>
                    <thead>
                        <tr>
                            <th>Identificación</th>
                            <th className="text-left">Nombre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suggestions.map((carrier, indexItem) => (
                            <tr key={carrier.id}
                                onClick={() => handleSelectLocal(carrier)}
                                className={`hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
                                ${indexItem % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}`}
                            >
                                <td>{carrier.atts.identication}</td>
                                <td className="text-left">{carrier.atts.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </TableResponsive>

                <div className="flex justify-center">
                    <CustomPagination />
                </div>
            </Modal>
        </>
    )
}