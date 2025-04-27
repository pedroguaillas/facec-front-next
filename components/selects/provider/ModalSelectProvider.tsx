import { Modal, TableResponsive, Paginate } from "@/components";
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useEffect, useState } from "react";
import { GeneralPaginate, Links, Meta } from "@/types";
import { initialLinks, initialMeta } from "@/constants/initialValues";

interface Props {
    show: boolean;
    handleSelect: (custom: SupplierProps) => void;
    onClose: () => void; // Nuevo
}

export const ModalSelectProvider = ({ show, handleSelect, onClose }: Props) => {

    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta>({ ...initialMeta });
    const [links, setLinks] = useState<Links>({ ...initialLinks });
    const [suggestions, setSuggestions] = useState<SupplierProps[]>([]);
    const axiosAuth = useAxiosAuth();

    const fetchProvider = async (page: string = 'page=1') => {
        if (!page) return;

        const pageNumber = page.split("=")[1];
        try {
            const res = await axiosAuth.post<GeneralPaginate<CustomerProps>>(`providerlist?page=${pageNumber}`, {
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
            fetchProvider(pageUrl);
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchProvider();
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        if (show) fetchProvider();
    }, [show]);

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
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
                            onClick={() => handleSelect(provider)}
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
    );
}

export default ModalSelectProvider;
