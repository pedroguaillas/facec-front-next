import { TableResponsive } from "@/components"
import { useReferralGuides } from "../context/ReferralGuidesContext"
import { FaInfoCircle } from "react-icons/fa";
import { Dropdown } from "./Dropdown";
import { useState } from "react";
import Link from "next/link";

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
                    <th className="text-left">PERIODO RUTA</th>
                    <th>SERIE</th>
                    <th className="text-left">CLIENTE / DESTINATARIO</th>
                    <th>ESTADO</th>
                    <th className="text-left">TRANSPORTISTA</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {referralGuides.map((referralGuide, index) => (
                    <tr key={referralGuide.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                        <td className="text-left">{`${referralGuide.atts.date_start} - ${referralGuide.atts.date_end}`}</td>
                        <td>
                            <Link className="hover:underline cursor-pointer text-blue-500" href={`/referralguides/${referralGuide.id}`}>
                                {referralGuide.atts.serie}
                            </Link>
                        </td>
                        <td className="text-left">{referralGuide.customer.name}</td>
                        <td>
                            <span
                                className={`relative px-2 py-1 rounded-2xl text-sm text-center inline-block
                                            ${referralGuide.atts?.state === 'AUTORIZADO' ? 'bg-green-700 text-white' : ''}
                                            ${["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(referralGuide.atts?.state)
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900'
                                        : ''}
                                        `}
                            >
                                {referralGuide.atts?.state || "CREADO"}

                                {["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(referralGuide.atts?.state) && (
                                    <div className="absolute -top-1 -right-1 group">
                                        <FaInfoCircle className="text-gray-400 cursor-pointer" />
                                        <div className="absolute -top-6 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                            {referralGuide.atts.extra_detail}
                                        </div>
                                    </div>
                                )}
                            </span>
                        </td>
                        <td className="text-left">{referralGuide.carrier.name}</td>
                        <td className="w-1">
                            <Dropdown isOpen={dropdown[index]} index={index} referralGuide={referralGuide} only={referralGuides.length === 1 || index > referralGuides.length - 5} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    )
}

export default ReferrralGuidesList;
