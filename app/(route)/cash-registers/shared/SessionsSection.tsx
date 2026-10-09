"use client";

import { useCallback, useEffect, useState } from "react";
import { IconButton, MovementsSection, Paginate, PrimaryButton, Separate, TableResponsive } from "@/components";
import { getCashRegisterSessions } from "../services/cashRegistersServices";
import { cashRegisterStatusLabels } from "@/constants";
import { OpenCashRegisterModal } from "./OpenCashRegisterModal";
import { CloseCashRegisterModal } from "./CloseCashRegisterModal";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { CashRegisterActiveSession, CashRegisterSession, CashRegisterType, Links, Meta } from "@/types";

interface Props {
    cashRegisterId: number;
    cashRegisterType: CashRegisterType;
    activeSession: CashRegisterActiveSession | null;
    onActiveSessionChange: () => void;
}

export const SessionsSection = ({ cashRegisterId, cashRegisterType, activeSession, onActiveSessionChange }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [sessions, setSessions] = useState<CashRegisterSession[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [modal, setModal] = useState<'open' | 'close' | null>(null);

    const fetchSessions = useCallback(async (pageUrl?: string) => {
        const { data } = await getCashRegisterSessions(axiosAuth, cashRegisterId, pageUrl);
        if (data) {
            setSessions(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        }
    }, [axiosAuth, cashRegisterId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchSessions(pageUrl);
    };

    const handleModalSaved = () => {
        setModal(null);
        fetchSessions();
        onActiveSessionChange();
    };

    const canClose = activeSession && cashRegisterType !== 'GENERAL';

    return (
        <div>
            <Separate />
            <div className="flex justify-between items-center">
                <div>
                    <strong className="font-bold">Estado: </strong>
                    {activeSession ? cashRegisterStatusLabels.ABIERTA : cashRegisterStatusLabels.CERRADA}
                    {activeSession && <span className="ml-4"><strong className="font-bold">Saldo actual: </strong>{activeSession.current_balance}</span>}
                </div>
                {(!activeSession || canClose) && (
                    <div className="w-36">
                        {activeSession
                            ? <PrimaryButton label="Cerrar caja" type="button" action="delete" onClick={() => setModal('close')} />
                            : <PrimaryButton label="Abrir caja" type="button" action="add" onClick={() => setModal('open')} />
                        }
                    </div>
                )}
            </div>

            {activeSession && (
                <MovementsSection sourceType="cash_register_session" sourceId={activeSession.id} title="Movimientos de la sesión actual" onChanged={onActiveSessionChange} />
            )}

            <Separate />
            <strong className="font-bold">Historial de sesiones</strong>
            <TableResponsive>
                <thead>
                    <tr>
                        <th>APERTURA</th>
                        <th>CIERRE</th>
                        <th>SALDO INICIAL</th>
                        <th>SALDO FINAL</th>
                        <th>ESTADO</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((session) => (
                        <tr key={session.id}>
                            <td>{session.atts.opened_at}</td>
                            <td>{session.atts.closed_at ?? '-'}</td>
                            <td>{session.atts.initial_balance}</td>
                            <td>{session.atts.final_balance ?? '-'}</td>
                            <td>{cashRegisterStatusLabels[session.atts.status]}</td>
                            <td className="w-1">
                                <IconButton type="link" url={`/cash-registers/${cashRegisterId}/sessions/${session.id}`} action="view" title="Ver detalle" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
            <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />

            {modal === 'open' && (
                <OpenCashRegisterModal cashRegisterId={cashRegisterId} onClose={() => setModal(null)} onSaved={handleModalSaved} />
            )}
            {modal === 'close' && (
                <CloseCashRegisterModal cashRegisterId={cashRegisterId} onClose={() => setModal(null)} onSaved={handleModalSaved} />
            )}
        </div>
    )
}
