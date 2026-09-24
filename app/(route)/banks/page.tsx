"use client";

import { useState } from "react";
import { Modal, Paginate, Title } from "@/components";
import { BanksProvider, useBanks } from "./context/BanksContext";
import { BanksFilter, BanksTable } from "./components";
import { BankFormModal } from "./shared/BankFormModal";
import { BankAccountsSection } from "./shared/BankAccountsSection";
import { Bank, BankProps } from "@/types";

type ModalState =
    | { type: 'form'; bank: Bank | null }
    | { type: 'accounts'; bank: BankProps }
    | null;

const BanksContent = () => {
    const { meta, links, fetchBanks } = useBanks();
    const [modal, setModal] = useState<ModalState>(null);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchBanks(pageUrl);
    };

    const handleSaved = () => {
        setModal(null);
        fetchBanks();
    };

    return (
        <div className="dark:text-gray-300">
            <Title
                title='Bancos'
                subTitle='Lista de todos los bancos'
                actions={[{ label: "", type: "button", action: "add", onClick: () => setModal({ type: 'form', bank: null }) }]}
            />
            <div className="md:mx-8 py-4">
                <BanksFilter />
                <BanksTable
                    onEdit={(bank) => setModal({ type: 'form', bank: { id: bank.id, name: bank.atts.name } })}
                    onViewAccounts={(bank) => setModal({ type: 'accounts', bank })}
                />
                <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
            </div>

            {modal?.type === 'form' && (
                <BankFormModal bank={modal.bank} onClose={() => setModal(null)} onSaved={handleSaved} />
            )}

            <Modal
                isOpen={modal?.type === 'accounts'}
                onClose={() => setModal(null)}
                title={modal?.type === 'accounts' ? `Cuentas bancarias - ${modal.bank.atts.name}` : ''}
                modalSize="lg"
            >
                {modal?.type === 'accounts' && (
                    <BankAccountsSection bankId={modal.bank.id} />
                )}
            </Modal>
        </div>
    )
}

const PageBanks = () => {
    return (
        <BanksProvider>
            <BanksContent />
        </BanksProvider>
    )
}

export default PageBanks;
