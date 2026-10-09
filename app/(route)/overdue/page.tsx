"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Title, TableResponsive } from "@/components";
import { getCustomersOverdue, getProvidersOverdue } from "@/services/overdueServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { OverdueSummary } from "@/types";

type PartyType = 'customer' | 'provider';

const OverdueDocuments = ({ partyType, documents }: { partyType: PartyType; documents: OverdueSummary['parties'][number]['documents'] }) => (
    <TableResponsive>
        <thead>
            <tr>
                <th>SERIE</th>
                <th>VENCIMIENTO</th>
                <th>DÍAS VENCIDO</th>
                <th>PENDIENTE</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {documents.map(doc => (
                <tr key={doc.order_id ?? doc.shop_id}>
                    <td>{doc.serie}</td>
                    <td>{doc.due_date}</td>
                    <td>{doc.days_overdue}</td>
                    <td>${doc.pending.toFixed(2)}</td>
                    <td className="w-1">
                        <Link
                            className="text-xs text-primary hover:underline whitespace-nowrap"
                            href={partyType === 'customer' ? `/orders/${doc.order_id}` : `/shops/${doc.shop_id}`}
                        >
                            Ver
                        </Link>
                    </td>
                </tr>
            ))}
        </tbody>
    </TableResponsive>
);

const OverdueTable = ({ partyType, summary }: { partyType: PartyType; summary: OverdueSummary | null }) => {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    if (!summary) return <p className="text-sm opacity-70 py-4">Cargando...</p>;

    if (summary.parties.length === 0) {
        return <p className="text-sm opacity-70 py-4">Sin cartera vencida.</p>;
    }

    const toggle = (id: number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th className="text-left">{partyType === 'customer' ? 'CLIENTE' : 'PROVEEDOR'}</th>
                    <th>DOCUMENTOS</th>
                    <th>TOTAL VENCIDO</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {summary.parties.map((party) => {
                    const id = partyType === 'customer' ? party.customer_id! : party.provider_id!;
                    const name = partyType === 'customer' ? party.customer_name : party.provider_name;
                    const isOpen = !!expanded[id];

                    return (
                        <Fragment key={id}>
                            <tr>
                                <td className="text-left">{name}</td>
                                <td>{party.documents.length}</td>
                                <td>${party.total_overdue.toFixed(2)}</td>
                                <td className="w-1">
                                    <button
                                        type="button"
                                        onClick={() => toggle(id)}
                                        className="text-xs text-primary hover:underline whitespace-nowrap"
                                    >
                                        {isOpen ? 'Ocultar' : 'Ver detalle'}
                                    </button>
                                </td>
                            </tr>
                            {isOpen && (
                                <tr>
                                    <td colSpan={4} className="p-2">
                                        <OverdueDocuments partyType={partyType} documents={party.documents} />
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })}
            </tbody>
        </TableResponsive>
    );
};

const PageOverdue = () => {

    const axiosAuth = useAxiosAuth();
    const [tab, setTab] = useState<PartyType>('customer');
    const [customers, setCustomers] = useState<OverdueSummary | null>(null);
    const [providers, setProviders] = useState<OverdueSummary | null>(null);

    useEffect(() => {
        getCustomersOverdue(axiosAuth).then(({ data }) => { if (data) setCustomers(data); });
        getProvidersOverdue(axiosAuth).then(({ data }) => { if (data) setProviders(data); });
    }, [axiosAuth]);

    return (
        <div className="dark:text-gray-300">
            <Title title="Cartera vencida" subTitle="Ventas y compras a crédito o anticipo, vencidas y con saldo pendiente" />
            <div className="md:mx-8 py-4">
                <div className="flex gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => setTab('customer')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${tab === 'customer' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                    >
                        Por cobrar{customers ? ` ($${customers.total_overdue.toFixed(2)})` : ''}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('provider')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${tab === 'provider' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                    >
                        Por pagar{providers ? ` ($${providers.total_overdue.toFixed(2)})` : ''}
                    </button>
                </div>

                <OverdueTable partyType={tab} summary={tab === 'customer' ? customers : providers} />
            </div>
        </div>
    );
};

export default PageOverdue;
