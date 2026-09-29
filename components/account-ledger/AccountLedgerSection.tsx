"use client";

import { useCallback, useEffect, useState } from "react";
import { Paginate, PrimaryButton, Separate, TableResponsive } from "@/components";
import { OpeningBalanceModal } from "./OpeningBalanceModal";
import { AdvanceModal } from "./AdvanceModal";
import { getCustomerAccountReceivable, getProviderAccountPayable, getCustomerAdvances, getProviderAdvances } from "@/services/accountLedgerServices";
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
    const [advancesAvailable, setAdvancesAvailable] = useState<number | null>(null);
    const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

    const fetchAdvances = useCallback(async () => {
        const { data } = partyType === 'customer'
            ? await getCustomerAdvances(axiosAuth, partyId)
            : await getProviderAdvances(axiosAuth, partyId);
        if (data) {
            setAdvancesAvailable(data.total_remaining);
        }
    }, [axiosAuth, partyType, partyId]);

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

    useEffect(() => {
        fetchAdvances();
    }, [fetchAdvances]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchEntries(pageUrl);
    };

    return (
        <div>
            <Separate />
            <div className="flex justify-between items-center gap-4">
                <strong className="font-bold">{title}</strong>
                <div className="flex items-center gap-4">
                    {currentBalance !== null && (
                        <span><strong className="font-bold">Saldo actual: </strong>{currentBalance.toFixed(2)}</span>
                    )}
                    {!!advancesAvailable && (
                        <span><strong className="font-bold">Anticipo disponible: </strong>{advancesAvailable.toFixed(2)}</span>
                    )}
                    <div className="w-48">
                        <PrimaryButton label="Registrar anticipo" type="button" action="add" onClick={() => setIsAdvanceModalOpen(true)} />
                    </div>
                    <div className="w-52">
                        <PrimaryButton label="Registrar saldo anterior" type="button" action="add" onClick={() => setIsOpeningBalanceModalOpen(true)} />
                    </div>
                </div>
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

            {isOpeningBalanceModalOpen && (
                <OpeningBalanceModal
                    partyType={partyType}
                    partyId={partyId}
                    onClose={() => setIsOpeningBalanceModalOpen(false)}
                    onSaved={() => {
                        setIsOpeningBalanceModalOpen(false);
                        fetchEntries();
                    }}
                />
            )}

            {isAdvanceModalOpen && (
                <AdvanceModal
                    partyType={partyType}
                    partyId={partyId}
                    onClose={() => setIsAdvanceModalOpen(false)}
                    onSaved={() => {
                        setIsAdvanceModalOpen(false);
                        fetchEntries();
                        fetchAdvances();
                    }}
                />
            )}
        </div>
    )
}
