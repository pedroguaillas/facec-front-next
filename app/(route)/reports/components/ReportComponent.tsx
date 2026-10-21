"use client";

import { PrimaryButton, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useToast } from "@/context/ToastContext";
import { downloadFile } from "@/helpers/downloadHelper";
import { ChangeEvent, useState } from "react";

type ReportType = "Compras" | "Ventas";

export const ReportComponent = () => {

    const [month, setMonth] = useState('');
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<ReportType | null>(null);
    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        setMonth(event.target.value);
        setError(undefined);
    }

    const donwloadExcel = async (type: ReportType) => {
        if (!month) {
            setError('Seleccione el mes');
            return;
        }
        setLoading(type);
        // Mismo patrón en ambos: {recurso}/export/YYYY-MM
        const message = await downloadFile(
            axiosAuth,
            type === 'Compras' ? `shops/export/${month}` : `orders/export/${month}`,
            {},
            `${type === 'Compras' ? 'compras' : 'ventas'}-${month}.xlsx`,
        );
        setLoading(null);
        if (message) toast(message, 'error');
    }

    return (
        <div className="py-2">
            <strong className='font-bold'>Reporte de compras y ventas</strong>

            {/* Row */}
            <div className='flex flex-col gap-4'>

                {/* Col 1 */}
                <div className='w-50'>
                    <TextInput type='month' label='Mes' value={month} error={error} onChange={handleChange} name='month' />
                </div>

                <div className="flex gap-2 mt-2">
                    <div className="w-28">
                        <PrimaryButton label="Ventas" onClick={() => donwloadExcel('Ventas')} type="button" action="export" isLoading={loading === 'Ventas'} />
                    </div>
                    <div className="w-28">
                        <PrimaryButton label="Compras" onClick={() => donwloadExcel('Compras')} type="button" action="export" isLoading={loading === 'Compras'} />
                    </div>
                </div>
            </div>
        </div>
    )
}
