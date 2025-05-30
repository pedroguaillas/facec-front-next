"use client";

import { PrimaryButton, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { ChangeEvent, useState } from "react";

export const ReportComponent = () => {

    const [month, setMonth] = useState('');
    const axiosAuth = useAxiosAuth();

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        setMonth(event.target.value)
    }

    const donwloadExcel = async (type: "Compras" | "Ventas") => {
        try {
            await axiosAuth
                .get(
                    type === 'Compras'
                        ? `shops/${month}/export`
                        : `orders/export/${month}`,
                    { responseType: 'blob' }
                )
                .then(({ data }) => {
                    const blob = new Blob([data], {
                        type:
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;'
                    })

                    const a = document.createElement('a') //Create <a>
                    // a.href = 'data:text/xlsx;base64,' + res.data //Image Base64 Goes here
                    a.href = URL.createObjectURL(blob) //Image Base64 Goes here
                    a.download = `${type}.xlsx` //File name Here
                    a.click() //Downloaded file
                })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="py-2">
            <strong className='font-bold'>Reporte de compras y ventas</strong>

            {/* Row */}
            <div className='flex flex-col gap-4'>

                {/* Col 1 */}
                <div className='w-50'>
                    <TextInput type='month' label='Mes' value={month} onChange={handleChange} name='month' />
                </div>

                <div className="flex mt-2">
                    <div className="w-28">
                        <PrimaryButton label="Ventas" onClick={() => donwloadExcel('Ventas')} type="button" action="export" />
                    </div>
                </div>
            </div>
        </div>
    )
}
