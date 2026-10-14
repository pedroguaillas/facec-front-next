"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paginate, Title } from "@/components";
import { BanksProvider, useBanks } from "./context/BanksContext";
import { BankAccountsList } from "./components";
import { BankAccountFormModal } from "./shared/BankAccountFormModal";

const BanksContent = () => {
    const { meta, links, fetchAccounts } = useBanks();
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchAccounts(pageUrl);
    };

    return (
        <div className="dark:text-gray-300">
            <Title
                title="Bancos"
                subTitle="Tus cuentas y cuánto hay en cada una"
                actions={[{ label: "Agregar cuenta", type: "button", action: "add", onClick: () => setIsCreating(true) }]}
            />
            <div className="md:mx-8 py-4 mt-4">
                <BankAccountsList onCreate={() => setIsCreating(true)} />
                <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
            </div>

            {isCreating && (
                <BankAccountFormModal
                    account={null}
                    onClose={() => setIsCreating(false)}
                    // Recién creada: se abre su detalle para registrar movimientos
                    onSaved={(account) => router.push(`/banks/${account.id}`)}
                />
            )}
        </div>
    );
};

const PageBanks = () => (
    <BanksProvider>
        <BanksContent />
    </BanksProvider>
);

export default PageBanks;
