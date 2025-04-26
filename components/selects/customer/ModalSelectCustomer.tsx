import { Modal, TableResponsive, Paginate } from "@/components";
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useEffect, useState } from "react";
import { GeneralPaginate, Links, Meta } from "@/types";
import { initialLinks, initialMeta } from "@/constants/initialValues";

interface Props {
    show: boolean;
    handleSelect: (custom: CustomerProps) => void;
    onClose: () => void; // Nuevo
}

export const ModalSelectCustomer = ({ show, handleSelect, onClose }: Props) => {

    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<CustomerProps[]>([]);
    const axiosAuth = useAxiosAuth();

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
        if (show) fetchCustomer();
    }, [show]);

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title="Seleccionar cliente"
            modalSize="lg"
        >
            <input
                type="search"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <TableResponsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Código</th>
                        <th className="text-left">Ciente/Razon social</th>
                    </tr>
                </thead>
                <tbody>
                    {suggestions.map((custom, indexItem) => (
                        <tr
                            key={custom.id}
                            onClick={() => handleSelect(custom)}
                            className="hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                            <td>{indexItem + 1}</td>
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
    );
}

export default ModalSelectCustomer;
