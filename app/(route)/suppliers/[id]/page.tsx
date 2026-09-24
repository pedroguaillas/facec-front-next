"use client";

import { useParams } from "next/navigation";
import { SupplierForm } from "../shared/SupplierForm";
import { AccountLedgerSection, RequiredFields, Separate, Title } from "@/components";

const PageEditSupplier = () => {

    const params = useParams();
    const id = params.id as string;

    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Proveedor"
                subTitle="Editar un proveedor"
                actions={[{ label: "Regresar", type: "link", url: "/suppliers", action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <RequiredFields />
                    <Separate />
                    <SupplierForm />

                    <AccountLedgerSection partyType="provider" partyId={Number(id)} title="Cuentas por pagar" />
                </div>
            </div>
        </div>
    )
}

export default PageEditSupplier;
