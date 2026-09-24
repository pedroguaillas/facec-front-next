"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, IconButton, Modal, MovementsSection, PrimaryButton, Separate, TableResponsive } from "@/components";
import { getBankAccounts, deleteBankAccount } from "../services/bankAccountsServices";
import { bankAccountTypeOptions } from "@/constants";
import { BankAccountFormModal } from "./BankAccountFormModal";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { BankAccount, BankAccountProps } from "@/types";

interface Props {
    bankId: number;
}

export const BankAccountsSection = ({ bankId }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [accounts, setAccounts] = useState<BankAccountProps[]>([]);
    const [editing, setEditing] = useState<BankAccount | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [movementsAccountId, setMovementsAccountId] = useState<number | null>(null);

    const fetchAccounts = useCallback(async () => {
        const { data } = await getBankAccounts(axiosAuth, bankId);
        if (data) {
            setAccounts(data.data);
        }
    }, [axiosAuth, bankId]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleCreate = () => {
        setEditing(null);
        setIsModalOpen(true);
    };

    const handleEdit = (account: BankAccountProps) => {
        setEditing({
            id: account.id,
            bank_id: bankId,
            account_number: account.atts.account_number,
            type: account.atts.type,
            balance: account.atts.balance,
        });
        setIsModalOpen(true);
    };

    const handleSaved = () => {
        setIsModalOpen(false);
        fetchAccounts();
    };

    const confirmation = (accept: boolean) => {
        if (accept) {
            deleteBankAccount(deleteId ?? 0, axiosAuth).then(() => {
                setDeleteId(null);
                fetchAccounts();
            });
        }
    };

    const typeLabel = (type: BankAccountProps['atts']['type']) =>
        bankAccountTypeOptions.find(it => it.value === type)?.label ?? type;

    return (
        <div>
            <Separate />
            <div className="flex justify-between items-center">
                <strong className="font-bold">Cuentas bancarias</strong>
                <div className="w-44">
                    <PrimaryButton label="Nueva cuenta" type="button" action="add" onClick={handleCreate} />
                </div>
            </div>

            <TableResponsive>
                <thead>
                    <tr>
                        <th className="text-left">NÚMERO DE CUENTA</th>
                        <th>TIPO</th>
                        <th>SALDO</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account, index) => (
                        <tr key={account.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                            <td className="text-left">{account.atts.account_number}</td>
                            <td>{typeLabel(account.atts.type)}</td>
                            <td>{account.atts.balance}</td>
                            <td className="w-1">
                                <div className="flex gap-2">
                                    <IconButton type="button" action="view" onClick={() => setMovementsAccountId(account.id)} title="Movimientos" />
                                    <IconButton type="button" action="edit" onClick={() => handleEdit(account)} title="Editar" />
                                    <IconButton type="button" action="delete" onClick={() => setDeleteId(account.id)} title="Eliminar" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>

            {isModalOpen && (
                <BankAccountFormModal
                    bankId={bankId}
                    account={editing}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmation}
                title="¿Estás seguro de querer eliminar esta cuenta bancaria?"
                sutTitle="Esta acción no se puede deshacer y eliminará la cuenta bancaria de forma permanente."
            />

            <Modal
                isOpen={movementsAccountId !== null}
                onClose={() => setMovementsAccountId(null)}
                title="Movimientos de la cuenta"
                modalSize="lg"
            >
                {movementsAccountId !== null && (
                    <MovementsSection sourceType="bank_account" sourceId={movementsAccountId} title="" onChanged={fetchAccounts} />
                )}
            </Modal>
        </div>
    )
}
