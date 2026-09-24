"use client";

import { useParams } from "next/navigation";
import { AccountLedgerSection, RequiredFields, Separate, Title } from "@/components"
import { CustomerForm } from "../shared/CustomerForm"

const PageEditCustomer = () => {

    const params = useParams();
    const id = params.id as string;

    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Cliente"
                subTitle="Editar un cliente"
                actions={[{ label: "Regresar", type: "link", url: "/customers", action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <RequiredFields />
                    <Separate />
                    <CustomerForm />

                    <AccountLedgerSection partyType="customer" partyId={Number(id)} title="Cuentas por cobrar" />
                </div>
            </div>
        </div>
    )
}
export default PageEditCustomer;
