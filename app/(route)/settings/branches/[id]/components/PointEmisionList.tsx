"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { EmisionPoint } from "@/types";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ModalFormEmisionPoint } from "./ModalFormEmisionPoint";

export const PointEmisionList = () => {

    const params = useParams();
    const axiosAuth = useAxiosAuth();

    const [emisionPoints, setEmisionPoints] = useState<EmisionPoint[]>([]);

    const fetchGetEmisionPoints = useCallback(async () => {
        const response = await axiosAuth.get(`branch/${params.id}`);
        setEmisionPoints(response.data.points);
    }, [axiosAuth, params]);

    useEffect(() => {
        fetchGetEmisionPoints()
    }, [axiosAuth, fetchGetEmisionPoints]);

    return (
        <>
            <ModalFormEmisionPoint branch_id={Number(params?.id)} fetchGetEmisionPoints={fetchGetEmisionPoints} />
            <div className="w-full overflow-x-auto py-4">
                <table className="w-full">
                    <thead>
                        <tr className="[&>th]:py-2 text-center [&>th]:dark:border-gray-500">
                            <th>Punt</th>
                            <th>Factura</th>
                            <th>Retención</th>
                            <th>Liquidación</th>
                            <th>Guia</th>
                            <th>N/C</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emisionPoints.map((emisionPoint, index) => (
                            <tr key={emisionPoint.point}
                                className={`text-center ${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''} [&>td]:p-1`}
                            >
                                <td>{(emisionPoint.point + '').padStart(3, '0')}</td>
                                <td>{emisionPoint.invoice}</td>
                                <td>{emisionPoint.retention}</td>
                                <td>{emisionPoint.settlementonpurchase}</td>
                                <td>{emisionPoint.referralguide}</td>
                                <td>{emisionPoint.creditnote}</td>
                            </tr>
                        ))}
                        <tr></tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}
