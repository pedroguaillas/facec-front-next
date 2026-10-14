"use client";

import { Title } from "@/components";
import { CashRegisterFormProvider, useCashRegisterFormContext } from "../context/CashRegisterFormContext";
import { SessionsSection } from "../shared/SessionsSection";
import { useParams } from "next/navigation";

const CashRegisterSessionsWrapper = ({ id }: { id: number }) => {
    const { cashRegister, refetchCashRegister } = useCashRegisterFormContext();
    return (
        <>
            <Title
                title={cashRegister.name ? `Caja ${cashRegister.name}` : 'Caja'}
                subTitle={cashRegister.uses_sessions ? 'Sesiones y movimientos' : 'Saldo y movimientos'}
                actions={[{ label: "Regresar", type: "link", url: "/cash-registers", action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
        <SessionsSection
            cashRegisterId={id}
            cashRegisterType={cashRegister.type}
            usesSessions={!!cashRegister.uses_sessions}
            activeSession={cashRegister.active_session}
            onActiveSessionChange={refetchCashRegister}
        />
                </div>
            </div>
        </>
    );
}

const PageCashRegisterSessions = () => {

    const params = useParams();
    const id = params.id as string;

    return (
        <div className='dark:text-gray-300'>
            <CashRegisterFormProvider id={id}>
                <CashRegisterSessionsWrapper id={Number(id)} />
            </CashRegisterFormProvider>
        </div>
    )
}
export default PageCashRegisterSessions;
