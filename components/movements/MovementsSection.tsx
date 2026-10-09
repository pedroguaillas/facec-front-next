"use client";

import { useCallback, useEffect, useState } from "react";
import { Paginate, PrimaryButton, Separate, TableResponsive } from "@/components";
import { movementTransactionTypeLabels, movementStatusLabels, paymentMethodOptions } from "@/constants";
import { getMovements, completeMovement } from "@/services/movementServices";
import { MovementFormModal } from "./MovementFormModal";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Links, Meta, Movement, MovementSourceType } from "@/types";

interface Props {
    sourceType: MovementSourceType;
    sourceId: number;
    title?: string;
    onChanged?: () => void;
}

export const MovementsSection = ({ sourceType, sourceId, title = 'Movimientos', onChanged }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [movements, setMovements] = useState<Movement[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMovements = useCallback(async (pageUrl?: string) => {
        const { data } = pageUrl
            ? await getMovements(axiosAuth, { party_type: sourceType, party_id: sourceId, page: extractPage(pageUrl) })
            : await getMovements(axiosAuth, { party_type: sourceType, party_id: sourceId });
        if (data) {
            setMovements(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        }
    }, [axiosAuth, sourceType, sourceId]);

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchMovements(pageUrl);
    };

    const handleComplete = async (id: number) => {
        await completeMovement(id, axiosAuth);
        fetchMovements();
        onChanged?.();
    };

    const handleSaved = () => {
        setIsModalOpen(false);
        fetchMovements();
        onChanged?.();
    };

    const paymentMethodLabel = (method: Movement['atts']['payment_method']) =>
        paymentMethodOptions.find(it => it.value === method)?.label ?? method;

    const counterpart = (movement: Movement) => {
        const isCurrentSource = movement.source_type === sourceType && movement.source.id === sourceId;
        const partyType = isCurrentSource ? movement.destination_type : movement.source_type;
        const party = isCurrentSource ? movement.destination : movement.source;

        if (!partyType || !party) return '-';
        return partyType === 'bank_account'
            ? `Cuenta ${'account_number' in party.atts ? party.atts.account_number : party.id}`
            : `Sesión caja #${party.id}`;
    };

    return (
        <div>
            <Separate />
            <div className="flex justify-between items-center">
                <strong className="font-bold">{title}</strong>
                <div className="w-44">
                    <PrimaryButton label="Nuevo movimiento" type="button" action="add" onClick={() => setIsModalOpen(true)} />
                </div>
            </div>

            <TableResponsive>
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>TRANSACCIÓN</th>
                        <th>MONTO</th>
                        <th>DESTINO/ORIGEN</th>
                        <th>PAGO</th>
                        <th>ESTADO</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map((movement) => (
                        <tr key={movement.id}>
                            <td>{movement.atts.date}</td>
                            <td>{movementTransactionTypeLabels[movement.atts.transaction_type]}</td>
                            <td>{movement.atts.amount}</td>
                            <td>{counterpart(movement)}</td>
                            <td>{paymentMethodLabel(movement.atts.payment_method)}</td>
                            <td>{movementStatusLabels[movement.atts.status]}</td>
                            <td className="w-1">
                                {movement.atts.status === 'PENDIENTE' && (
                                    <button
                                        type="button"
                                        onClick={() => handleComplete(movement.id)}
                                        className="text-xs text-primary hover:underline whitespace-nowrap"
                                    >
                                        Completar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
            <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />

            {isModalOpen && (
                <MovementFormModal
                    sourceType={sourceType}
                    sourceId={sourceId}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    )
}

const extractPage = (pageUrl: string): number => {
    const match = pageUrl.match(/[?&]page=(\d+)/);
    return match ? Number(match[1]) : 1;
};
