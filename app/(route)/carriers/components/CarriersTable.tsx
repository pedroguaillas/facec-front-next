"use client";

import { Dialog, IconButton, TableResponsive } from "@/components"
import { useCarriers } from "../context/CarriersContext"
import { axiosAuth } from "@/lib/axios";
import { deleteCarrier } from "@/services/carrierServices";

export const CarriersTable = () => {

    const { carriers, carrierDeleteId, fetchCarriers, setCarrierDeleteId } = useCarriers();

    const confirmation = (accept: boolean) => {
        if (accept) {
            deleteCarrier(carrierDeleteId ?? 0, axiosAuth).then(() => {
                setCarrierDeleteId(null);
                fetchCarriers();
            });
        }
    };

    return (
        <>
            <TableResponsive>
                <thead>
                    <tr>
                        <th>IDENTIFICACION</th>
                        <th className="text-left">NOMBRE</th>
                        <th>PLACA</th>
                        <th className="text-left">CORREO</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {carriers.map((carrier, index) => (
                        <tr key={carrier.id}
                            className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}
                        >
                            <td>{carrier.atts.identication}</td>
                            <td className="text-left">{carrier.atts.name}</td>
                            <td>{carrier.atts.license_plate}</td>
                            <td className="text-left">{carrier.atts.email}</td>
                            <td className="w-1">
                                <div className="flex gap-2">
                                    <IconButton type="link" url={`/carriers/${carrier.id}`} action="edit" title="Editar" />
                                    <IconButton type="button" action="delete" onClick={() => setCarrierDeleteId(carrier.id)} title="Eliminar" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
            <Dialog
                itemId={carrierDeleteId}
                confirmation={confirmation}
                title="¿Estás seguro de querer eliminar este transportista?"
                sutTitle="Esta acción no se puede deshacer y eliminará el transportista de forma permanente."
            />
        </>
    )
}
