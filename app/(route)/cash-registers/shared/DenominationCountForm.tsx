"use client";

import { useEffect, useState } from "react";
import { TableResponsive } from "@/components";
import { denominationTypeLabels } from "@/constants";
import { getDenominations } from "@/services/denominationServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Denomination, DenominationCount } from "@/types";

interface Props {
    onChange: (denominations: DenominationCount[], total: number) => void;
}

export const DenominationCountForm = ({ onChange }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [denominations, setDenominations] = useState<Denomination[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    useEffect(() => {
        const fetchDenominations = async () => {
            const { data } = await getDenominations(axiosAuth);
            if (data) {
                setDenominations(data.data);
            }
        }
        fetchDenominations();
    }, [axiosAuth]);

    const handleQuantityChange = (denominationId: number, quantity: number) => {
        const next = { ...quantities, [denominationId]: quantity };
        setQuantities(next);

        const counts = Object.entries(next)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => ({ denomination_id: Number(id), quantity: qty }));

        const total = denominations.reduce((sum, denomination) => {
            const qty = next[denomination.id] ?? 0;
            return sum + qty * denomination.atts.value;
        }, 0);

        onChange(counts, total);
    };

    return (
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
                    <tr key={denomination.id}>
                        <td className="text-left">{denomination.atts.value}</td>
                        <td>{denominationTypeLabels[denomination.atts.type]}</td>
                        <td>
                            <input
                                type="number" inputMode="numeric"
                                min={0}
                                className="w-20 border rounded-lg px-2 py-1 text-sm text-center bg-[var(--background)] border-[var(--border-strong)] focus:border-primary focus:outline-none dark:text-gray-300"
                                value={quantities[denomination.id] ?? 0}
                                onChange={(e) => handleQuantityChange(denomination.id, Number(e.target.value))}
                            />
                        </td>
                        <td>{((quantities[denomination.id] ?? 0) * denomination.atts.value).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    )
}
