"use client";

import { useCallback, useEffect, useState } from "react";
import { Paginate, Separate, TableResponsive } from "@/components";
import { getCustomerAccountReceivable, getProviderAccountPayable } from "@/services/accountLedgerServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { AccountLedgerEntry, Links, Meta } from "@/types";

interface Props {
    partyType: 'customer' | 'provider';
    partyId: number;
    title?: string;
}

export const AccountLedgerSection = ({ partyType, partyId, title = 'Estado de cuenta' }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [entries, setEntries] = useState<AccountLedgerEntry[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [currentBalance, setCurrentBalance] = useState<number | null>(null);

    const fetchEntries = useCallback(async (pageUrl?: string) => {
        const { data } = partyType === 'customer'
            ? await getCustomerAccountReceivable(axiosAuth, partyId, pageUrl)
            : await getProviderAccountPayable(axiosAuth, partyId, pageUrl);

        if (data) {
            setEntries(data.data);
            setMeta(data.meta);
            setLinks(data.links);
            if (!pageUrl) {
                setCurrentBalance(data.data[0]?.new_balance ?? 0);
            }
        }
    }, [axiosAuth, partyType, partyId]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchEntries(pageUrl);
    };

    return (
        <div>
            <Separate />
            <div className="flex justify-between items-center">
                <strong className="font-bold">{title}</strong>
                {currentBalance !== null && (
                    <span><strong className="font-bold">Saldo actual: </strong>{currentBalance.toFixed(2)}</span>
                )}
            </div>

            <TableResponsive>
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th className="text-left">DESCRIPCIÓN</th>
                        <th>DEBE</th>
                        <th>HABER</th>
                        <th>SALDO</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry, index) => (
                        <tr key={entry.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                            <td>{entry.date}</td>
                            <td className="text-left">{entry.description}</td>
                            <td>{entry.debe ? entry.debe.toFixed(2) : '-'}</td>
                            <td>{entry.haber ? entry.haber.toFixed(2) : '-'}</td>
                            <td>{entry.new_balance.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
            <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
        </div>
    )
}
