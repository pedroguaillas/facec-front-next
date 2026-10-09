"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MovementsSection, Separate, TableResponsive, Title } from "@/components";
import { getCashRegisterSession } from "../../../services/cashRegistersServices";
import { cashRegisterStatusLabels, denominationTypeLabels } from "@/constants";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { CashRegisterSession, CashRegisterSessionDenomination } from "@/types";

const DenominationsTable = ({ denominations }: { denominations: CashRegisterSessionDenomination[] }) => (
    <TableResponsive>
        <thead>
            <tr>
                <th className="text-left">DENOMINACIÓN</th>
                <th>TIPO</th>
                <th>CANTIDAD</th>
                <th>SUBTOTAL</th>
            </tr>
        </thead>
        <tbody>
            {denominations.map((denomination) => (
                <tr key={denomination.denomination_id}>
                    <td className="text-left">{denomination.value}</td>
                    <td>{denominationTypeLabels[denomination.denomination_type]}</td>
                    <td>{denomination.quantity}</td>
                    <td>{(denomination.value * denomination.quantity).toFixed(2)}</td>
                </tr>
            ))}
        </tbody>
    </TableResponsive>
);

const PageCashRegisterSession = () => {

    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const cashRegisterId = params.id as string;
    const sessionId = params.sessionId as string;
    const [session, setSession] = useState<CashRegisterSession | null>(null);

    const fetchSession = useCallback(async () => {
        const { data } = await getCashRegisterSession(axiosAuth, sessionId);
        if (data) {
            setSession(data);
        }
    }, [axiosAuth, sessionId]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    if (!session) return null;

    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Sesión de caja"
                subTitle={`Apertura: ${session.atts.opened_at}`}
                actions={[{ label: "Regresar", type: "link", url: `/cash-registers/${cashRegisterId}`, action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <p><strong className="font-bold">Estado: </strong>{cashRegisterStatusLabels[session.atts.status]}</p>
                    <p><strong className="font-bold">Saldo inicial: </strong>{session.atts.initial_balance}</p>
                    <p><strong className="font-bold">Saldo actual: </strong>{session.atts.current_balance}</p>
                    {session.atts.final_balance !== null && (
                        <p><strong className="font-bold">Saldo final: </strong>{session.atts.final_balance}</p>
                    )}

                    <Separate />
                    <strong className="font-bold">Arqueo de apertura</strong>
                    <DenominationsTable denominations={session.opening_denominations} />

                    {session.closing_denominations.length > 0 && (
                        <>
                            <strong className="font-bold">Arqueo de cierre</strong>
                            <DenominationsTable denominations={session.closing_denominations} />
                        </>
                    )}

                    <MovementsSection sourceType="cash_register_session" sourceId={session.id} title="Movimientos de la sesión" onChanged={fetchSession} />
                </div>
            </div>
        </div>
    )
}

export default PageCashRegisterSession;
