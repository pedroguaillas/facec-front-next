import { useCarriers } from "../context/CarriersContext"
import { TableResponsive } from "@/components"

export const CarriersTable = () => {

    const { carriers } = useCarriers();

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th>Identificación</th>
                    <th className="text-left">Nombre</th>
                    <th>Placa</th>
                    <th className="text-left">Correo</th>
                </tr>
            </thead>
            <tbody>
                {carriers.map((carrier) => (
                    <tr key={carrier.id}>
                        <td>{carrier.atts.identication}</td>
                        <td className="text-left">{carrier.atts.name}</td>
                        <td>{carrier.atts.license_plate}</td>
                        <td className="text-left">{carrier.atts.email}</td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    )
}
