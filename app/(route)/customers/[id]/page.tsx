"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AccountLedgerSection, Title } from "@/components"
import { getCustomer } from "../services/customersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Customer } from "@/types";

const PageCustomerAccounts = () => {

    const params = useParams();
    const id = params.id as string;
    const axiosAuth = useAxiosAuth();
    const [customer, setCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            const { data } = await getCustomer(axiosAuth, id);
            if (data) setCustomer(data);
        }
        fetchCustomer();
    }, [id, axiosAuth]);

    return (
        <div className='dark:text-gray-300'>
            <Title
                title={customer ? customer.name : 'Cliente'}
                subTitle={customer ? `${customer.identication} · Cuentas por cobrar` : 'Cuentas por cobrar'}
                actions={[{ label: "Regresar", type: "link", url: "/customers", action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <AccountLedgerSection partyType="customer" partyId={Number(id)} title="Cuentas por cobrar" />
                </div>
            </div>
        </div>
    )
}
export default PageCustomerAccounts;
