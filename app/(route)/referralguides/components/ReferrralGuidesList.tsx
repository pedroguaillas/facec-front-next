import { TableResponsive } from "@/components"
import { useReferralGuides } from "../context/ReferralGuidesContext"
import { FaInfoCircle } from "react-icons/fa";

const ReferrralGuidesList = () => {
    const { referralGuides } = useReferralGuides();
    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th className="text-left">Período ruta</th>
                    <th>Serie</th>
                    <th className="text-left">Cliente / Destinatario</th>
                    <th>Estado</th>
                    <th className="text-left">Transportista</th>
                </tr>
            </thead>
            <tbody>
                {referralGuides.map((referralGuide, index) => (
                    <tr key={referralGuide.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                        <th className="text-left">{`${referralGuide.atts.date_start} - ${referralGuide.atts.date_end}`}</th>
                        <th>{referralGuide.atts.serie}</th>
                        <th className="text-left">{referralGuide.customer.name}</th>
                        <th>
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
                        </th>
                        <th className="text-left">{referralGuide.carrier.name}</th>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    )
}

export default ReferrralGuidesList;
