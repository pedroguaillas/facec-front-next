import { SriStatus, TableResponsive, VoucherSerie } from "@/components"
import { useReferralGuides } from "../context/ReferralGuidesContext"
import { Dropdown } from "./Dropdown";
import { useState } from "react";
import { formatDate } from "@/helpers/dateHelper";

const ReferrralGuidesList = () => {
    const { referralGuides } = useReferralGuides();
    const [dropdown, setDropdown] = useState<boolean[]>([]);

    // ✅ Cierra todos los dropdowns excepto el seleccionado
    const handleDrops = (index: number | null) => {
        setDropdown((prev) => {
            const newDropdown = Array(prev.length).fill(false); // 🔴 Cierra todos los dropdowns
            if (index !== null)
                newDropdown[index] = !prev[index]; // 🟢 Alterna solo el seleccionado
            return newDropdown;
        });
    };
    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th className="text-left">Traslado</th>
                    <th className="text-left">Documento</th>
                    <th className="text-left">Destinatario</th>
                    <th>Estado</th>
                    <th className="text-left">Transportista</th>
                    <th className="w-10"><span className="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody>
                {referralGuides.map((referralGuide, index) => {
                    const { date_start, date_end } = referralGuide.atts;
                    const hasDetail = ["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(referralGuide.atts?.state);
                    return (
                    <tr key={referralGuide.id}>
                        {/* Inicio y fin del traslado; un solo día se muestra una vez */}
                        <td className="text-left whitespace-nowrap tabular-nums text-ink-2">
                            {formatDate(date_start)}
                            {date_end && date_end.slice(0, 10) !== date_start?.slice(0, 10) && (
                                <span className="text-ink-3"> – {formatDate(date_end)}</span>
                            )}
                        </td>
                        <td className="text-left">
                            <VoucherSerie serie={referralGuide.atts.serie} href={`/referralguides/${referralGuide.id}`} />
                        </td>
                        <td className="text-left min-w-48">{referralGuide.customer.name}</td>
                        <td>
                            <SriStatus state={referralGuide.atts?.state} detail={hasDetail ? referralGuide.atts.extra_detail : null} />
                        </td>
                        <td className="text-left min-w-40 text-ink-2">{referralGuide.carrier.name}</td>
                        <td>
                            <Dropdown isOpen={dropdown[index]} index={index} referralGuide={referralGuide} only={referralGuides.length === 1 || index > referralGuides.length - 5} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                    );
                })}
            </tbody>
        </TableResponsive>
    )
}

export default ReferrralGuidesList;
