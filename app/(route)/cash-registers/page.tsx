"use client";

import { useState } from "react";
import { Paginate, Title } from "@/components";
import { CashRegistersProvider, useCashRegisters } from "./context/CashRegistersContext";
import { CashRegistersFilter, CashRegistersTable } from "./components";
import { CashRegisterFormModal } from "./shared/CashRegisterFormModal";
import { OpenCashRegisterModal } from "./shared/OpenCashRegisterModal";
import { CloseCashRegisterModal } from "./shared/CloseCashRegisterModal";
import { CashRegisterProps } from "@/types";

type ModalState =
    | { type: 'form'; cashRegister: CashRegisterProps | null }
    | { type: 'open' | 'close'; cashRegisterId: number }
    | null;

const CashRegistersContent = () => {
    const { cashRegisters, meta, links, fetchCashRegisters } = useCashRegisters();
    const [modal, setModal] = useState<ModalState>(null);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        fetchCashRegisters(pageUrl);
    };

    const handleSaved = () => {
        setModal(null);
        fetchCashRegisters();
    };

    return (
        <div className="dark:text-gray-300">
            <Title
                title='Cajas'
                subTitle='Lista de todas las cajas'
                actions={[{ label: "", type: "button", action: "add", onClick: () => setModal({ type: 'form', cashRegister: null }) }]}
            />
            <div className="md:mx-8 py-4">
                <CashRegistersFilter />
                <CashRegistersTable
                    onEdit={(cashRegister) => setModal({ type: 'form', cashRegister })}
                    onOpen={(id) => setModal({ type: 'open', cashRegisterId: id })}
                    onClose={(id) => setModal({ type: 'close', cashRegisterId: id })}
                />
                <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
            </div>

            {modal?.type === 'form' && (
                <CashRegisterFormModal
                    cashRegister={modal.cashRegister ? {
                        id: modal.cashRegister.id,
                        name: modal.cashRegister.atts.name,
                        type: modal.cashRegister.atts.type,
                        responsible_id: modal.cashRegister.responsible.id,
                    } : null}
                    existingTypes={cashRegisters.map(cr => cr.atts.type)}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
            {modal?.type === 'open' && (
                <OpenCashRegisterModal cashRegisterId={modal.cashRegisterId} onClose={() => setModal(null)} onSaved={handleSaved} />
            )}
            {modal?.type === 'close' && (
                <CloseCashRegisterModal cashRegisterId={modal.cashRegisterId} onClose={() => setModal(null)} onSaved={handleSaved} />
            )}
        </div>
    )
}

const PageCashRegisters = () => {
    return (
        <CashRegistersProvider>
            <CashRegistersContent />
        </CashRegistersProvider>
    )
}

export default PageCashRegisters;
