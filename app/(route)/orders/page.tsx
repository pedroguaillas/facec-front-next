"use client";

import { useState, useEffect } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Meta } from "@/types/paginate";
import { Paginate, TableResponsive, Title } from "@/components";
import { ActionsTitle } from "@/types";
import { Dropdown } from "./components/Dropdown";

const Invoices = () => {
    const [orders, setOrders] = useState<OrderProps[]>([]);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState<Meta | null>(null);
    const [dropdown, setDropdown] = useState<boolean[]>([]);
    const { status } = useSession();

    const axiosAuth = useAxiosAuth();

    // Función para obtener las órdenes
    const fetchOrders = async (pageUrl: string | null) => {
        if (!pageUrl) return;

        try {
            // Asegurar que la URL es absoluta
            const fullUrl = new URL(pageUrl, process.env.NEXT_PUBLIC_API_URL).href;

            const page = new URL(fullUrl).searchParams.get("page") || "1"; // Extrae el número de página

            const res = await axiosAuth.post(`orderlist?page=${page}`, { search });
            setOrders(res.data.data);
            setMeta(res.data.meta);
        } catch (error) {
            console.error("Error al obtener facturas:", error);
        }
    };

    // Cargar datos al inicio
    useEffect(() => {
        if (status === "authenticated")
            fetchOrders("orderlist?page=1");
    }, [search, status]); // Recargar si cambia la búsqueda

    // Manejar cambios en el input de búsqueda
    const onChangeSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value); // Actualiza el estado para que useEffect haga la consulta
    };

    // Función para manejar el cambio de página
    const reqNewPage = async (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string | null) => {
        e.preventDefault();
        await fetchOrders(pageUrl);
    };

    const importOrders = () => {

    }

    // const singleAction: ActionsTitle = {
    //     label: "Import",
    //     type: "button",
    //     onClick: () => importOrders(),
    // };

    const multipleActions: ActionsTitle[] = [
        { label: "Import", type: "button", action: 'import', onClick: () => importOrders() },
        { label: "+", type: "link", url: 'orders/create', action: 'create' },
    ];

    const handleDrops = (index: number) => {
        dropdown[index] = !dropdown[index]
        if (dropdown[index]) {
            dropdown.forEach((drop, i) => {
                if (index !== i) {
                    dropdown[i] = false;
                }
            })
        }
        setDropdown([...dropdown])
    }

    return (
        <div className="dark:text-gray-300">

            <Title
                title="Ventas"
                subTitle="Lista de todas las ventas"
                actions={multipleActions}
            />

            <div className="md:mx-8 py-4">

                {/* Input search */}
                <div className="flex justify-end">
                    <input
                        className="rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 dark:focus:border-gray-500 dark:hover:border-gray-500"
                        type="search"
                        onChange={onChangeSearch} value={search}
                    />
                </div>

                {orders.length === 0 ? (
                    <p>No hay ventas registradas</p>
                ) : (
                    <TableResponsive>
                        <thead>
                            <tr>
                                <th>F. EMISIÓN</th>
                                <th>DOCUMENTO</th>
                                <th className="text-left">CLIENTE</th>
                                <th>ESTADO</th>
                                <th className="text-right">TOTAL</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={`order${index}`} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                                    <td>{order.atts?.date || "N/A"}</td>
                                    <td>{order.atts?.serie || "N/A"}</td>
                                    <td className="text-left uppercase">{order.customer?.name || "Desconocido"}</td>
                                    <td>
                                        <span className={order.atts?.state === 'AUTORIZADO' ? 'bg-green-700 px-2 py-1 text-gray-100 rounded-2xl' : ''}>
                                            {order.atts?.state || "N/A"}
                                        </span>
                                    </td>
                                    <td className="text-right">${order.atts?.total || "0.00"}</td>
                                    <td className="flex justify-end">
                                        <Dropdown isOpen={dropdown[index]} index={index} order={order} setIsOpen={handleDrops} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </TableResponsive>
                )}
                <Paginate
                    meta={meta}
                    reqNewPage={reqNewPage}
                />
            </div>
        </div>
    );
};

export default Invoices;
