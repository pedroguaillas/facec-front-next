"use client";

import { Dialog, IconButton, TableResponsive } from "@/components"
import { useBanks } from "../context/BanksContext"
import { axiosAuth } from "@/lib/axios";
import { deleteBank } from "../services/banksServices";
import { BankProps } from "@/types";

interface Props {
    onEdit: (bank: BankProps) => void;
    onViewAccounts: (bank: BankProps) => void;
}

export const BanksTable = ({ onEdit, onViewAccounts }: Props) => {

    const { banks, bankDeleteId, fetchBanks, setBankDeleteId } = useBanks();

    const confirmation = (accept: boolean) => {
        if (accept) {
            deleteBank(bankDeleteId ?? 0, axiosAuth).then(() => {
                setBankDeleteId(null);
                fetchBanks();
            });
        }
    };

    return (
        <>
            <TableResponsive>
                <thead>
                    <tr>
                        <th className="text-left">NOMBRE</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {banks.map((bank, index) => (
                        <tr key={bank.id}
                            className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}
                        >
                            <td className="text-left">{bank.atts.name}</td>
                            <td className="w-1">
                                <div className="flex gap-2">
                                    <IconButton type="button" action="edit" onClick={() => onEdit(bank)} title="Editar" />
                                    <IconButton type="button" action="view" onClick={() => onViewAccounts(bank)} title="Cuentas bancarias" />
                                    <IconButton type="button" action="delete" onClick={() => setBankDeleteId(bank.id)} title="Eliminar" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
            <Dialog
                itemId={bankDeleteId}
                confirmation={confirmation}
                title="¿Estás seguro de querer eliminar este banco?"
                sutTitle="Esta acción no se puede deshacer y eliminará el banco de forma permanente."
            />
        </>
    )
}
