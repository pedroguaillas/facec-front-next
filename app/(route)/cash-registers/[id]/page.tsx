"use client";

import { Title } from "@/components";
import { CashRegisterFormProvider, useCashRegisterFormContext } from "../context/CashRegisterFormContext";
import { SessionsSection } from "../shared/SessionsSection";
import { useParams } from "next/navigation";

const CashRegisterSessionsWrapper = ({ id }: { id: number }) => {
    const { cashRegister, refetchCashRegister } = useCashRegisterFormContext();
    return (
        <SessionsSection
            cashRegisterId={id}
            cashRegisterType={cashRegister.type}
            activeSession={cashRegister.active_session}
            onActiveSessionChange={refetchCashRegister}
        />
    );
}

const PageCashRegisterSessions = () => {

    const params = useParams();
    const id = params.id as string;

    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Caja"
                subTitle="Historial de sesiones"
                actions={[{ label: "Regresar", type: "link", url: "/cash-registers", action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <CashRegisterFormProvider id={id}>
                        <CashRegisterSessionsWrapper id={Number(id)} />
                    </CashRegisterFormProvider>
                </div>
            </div>
        </div>
    )
}
export default PageCashRegisterSessions;
