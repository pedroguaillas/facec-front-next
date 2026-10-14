"use client";

import { IconButton, TableResponsive } from "@/components"
import { useCashRegisters } from "../context/CashRegistersContext"
import { cashRegisterStatusLabels, cashRegisterTypeOptions } from "@/constants";
import { CashRegisterProps } from "@/types";

interface Props {
    onEdit: (cashRegister: CashRegisterProps) => void;
    onOpen: (cashRegisterId: number) => void;
    onClose: (cashRegisterId: number) => void;
}

export const CashRegistersTable = ({ onEdit, onOpen, onClose }: Props) => {

    const { cashRegisters } = useCashRegisters();

    const typeLabel = (type: CashRegisterProps['atts']['type']) =>
        cashRegisterTypeOptions.find(it => it.value === type)?.label ?? type;

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th className="text-left">NOMBRE</th>
                    <th>TIPO</th>
                    <th>RESPONSABLE</th>
                    <th>ESTADO</th>
                    <th>SALDO ACTUAL</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {cashRegisters.map((cashRegister) => {
                    // Sin apertura y cierre la caja está siempre abierta: no hay botones de abrir/cerrar
                    const usesSessions = !!cashRegister.atts.uses_sessions;
                    const canClose = usesSessions && cashRegister.active_session && cashRegister.atts.type !== 'GENERAL';

                    return (
                        <tr key={cashRegister.id}
                        >
                            <td className="text-left">{cashRegister.atts.name}</td>
                            <td>{typeLabel(cashRegister.atts.type)}</td>
                            <td>{cashRegister.responsible.name}</td>
                            <td>{usesSessions ? cashRegisterStatusLabels[cashRegister.atts.status] : 'Siempre abierta'}</td>
                            <td>{cashRegister.active_session?.atts.current_balance ?? '-'}</td>
                            <td className="w-1">
                                <div className="flex gap-1">
                                    <IconButton type="button" action="edit" onClick={() => onEdit(cashRegister)} title="Editar" />
                                    {cashRegister.active_session
                                        ? canClose && <IconButton type="button" action="close" onClick={() => onClose(cashRegister.id)} title="Cerrar caja" />
                                        : usesSessions && <IconButton type="button" action="open" onClick={() => onOpen(cashRegister.id)} title="Abrir caja" />
                                    }
                                    <IconButton type="link" url={`/cash-registers/${cashRegister.id}`} action="view" title={usesSessions ? 'Historial de sesiones' : 'Movimientos'} />
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </TableResponsive>
    )
}
