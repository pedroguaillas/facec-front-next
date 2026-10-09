"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AccountLedgerSection, Title } from "@/components";
import { getSupplier } from "../services/suppliersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Supplier } from "@/types";

const PageSupplierAccounts = () => {

    const params = useParams();
    const id = params.id as string;
    const axiosAuth = useAxiosAuth();
    const [supplier, setSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        const fetchSupplier = async () => {
            const { data } = await getSupplier(id, axiosAuth);
            if (data) setSupplier(data);
        }
        fetchSupplier();
    }, [id, axiosAuth]);

    return (
        <div className='dark:text-gray-300'>
            <Title
                title={supplier ? supplier.name : 'Proveedor'}
                subTitle={supplier ? `${supplier.identication} · Cuentas por pagar` : 'Cuentas por pagar'}
                actions={[{ label: "Regresar", type: "link", url: "/suppliers", action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <AccountLedgerSection partyType="provider" partyId={Number(id)} title="Cuentas por pagar" />
                </div>
            </div>
        </div>
    )
}

export default PageSupplierAccounts;
