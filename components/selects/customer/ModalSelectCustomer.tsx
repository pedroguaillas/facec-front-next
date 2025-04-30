import { Modal, TableResponsive, Paginate } from "@/components";
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useEffect, useState } from "react";
import { GeneralPaginate, Links, Meta } from "@/types";
import { initialLinks, initialMeta } from "@/constants/initialValues";
import { FaSearch } from "react-icons/fa";

interface Props {
    handleSelect: (custom: CustomerProps) => void;
}

export const ModalSelectCustomer = ({ handleSelect }: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<CustomerProps[]>([]);
    const axiosAuth = useAxiosAuth();

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    const fetchCustomer = async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<CustomerProps>>(`customerlist?page=${pageNumber}`, {
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

    const handleSelectLocal = (custom: CustomerProps) => {
        handleSelect(custom);
        toggle();
    }

    const CustomPagination = () => {

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchCustomer(pageUrl);
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchCustomer();
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        if (isOpen) {
            // Verificado que no ejecuete en bucle
            fetchCustomer()
        }
    }, [isOpen]);

    return (
        <>
            <span onClick={toggle} className='p-2 bg-primary text-white cursor-pointer'>
                <FaSearch />
            </span>

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Seleccionar cliente"
                modalSize="lg"
            >
                <input
                    type="search"
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-2 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="hidden sm:block">#</th>
                            <th>Identificación</th>
                            <th className="text-left">Ciente/Razon social</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suggestions.map((custom, indexItem) => (
                            <tr
                                key={custom.id}
                                onClick={() => handleSelectLocal(custom)}
                                className={`hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
                                ${indexItem % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}`}
                            >
                                <td className="hidden sm:block">{indexItem + 1}</td>
                                <td>{custom.atts.identication}</td>
                                <td className="text-left">{custom.atts.name}</td>
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

export default ModalSelectCustomer;
