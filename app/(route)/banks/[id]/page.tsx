"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dialog, MovementsSection, Title } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { BankAccount } from "@/types";
import { deleteBankAccount, getBankAccount } from "../services/bankAccountsServices";
import { getBank } from "../services/banksServices";
import { BankAccountFormModal } from "../shared/BankAccountFormModal";
import { accountTypeLabel, groupDigits, money } from "../shared/bankUi";

const PageBankAccount = () => {

    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const { toast } = useToast();
    const [account, setAccount] = useState<BankAccount | null>(null);
    const [bankName, setBankName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchAccount = useCallback(async () => {
        if (status !== 'authenticated') return;
        const { data } = await getBankAccount(axiosAuth, id);
        if (!data) return;
        setAccount(data);
        const bank = await getBank(axiosAuth, String(data.bank_id));
        if (bank.data) setBankName(bank.data.name);
    }, [axiosAuth, id, status]);

    useEffect(() => {
        fetchAccount();
    }, [fetchAccount]);

    const confirmation = async (accept: boolean) => {
        if (!accept) return;
        const { error, errors } = await deleteBankAccount(Number(id), axiosAuth);
        setDeleteId(null);
        if (error || errors) {
            toast(error ?? Object.values(errors ?? {})[0] ?? 'No se pudo eliminar la cuenta', 'error');
            return;
        }
        toast('Cuenta eliminada');
        router.push('/banks');
    };

    const balance = Number(account?.balance ?? 0);

    return (
        <div className="dark:text-gray-300">
            <Title
                title={bankName || 'Cuenta bancaria'}
                subTitle="Saldo y movimientos de la cuenta"
                actions={[{ label: "Regresar", type: "link", url: "/banks", action: "back" }]}
            />

            <div className="md:mx-8 py-4 mt-4 flex flex-col gap-4">
                {/* Cabecera tipo estado de cuenta: qué cuenta es y cuánto hay */}
                <section className="rounded-xl border border-line bg-surface p-4 lg:p-6 flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
                            {account ? `Cuenta de ${accountTypeLabel(account.type).toLowerCase()}` : 'Cuenta'}
                        </p>
                        <p className="mt-1 font-mono text-lg tabular-nums text-ink-1 break-all">
                            {account ? groupDigits(account.account_number) : '…'}
                        </p>
                        <div className="mt-2 flex gap-4 text-sm">
                            <button type="button" onClick={() => setIsEditing(true)} disabled={!account} className="text-primary hover:underline disabled:opacity-50">
                                Editar
                            </button>
                            <button type="button" onClick={() => setDeleteId(Number(id))} disabled={!account} className="text-sri-fail hover:underline disabled:opacity-50">
                                Eliminar
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Saldo</p>
                        <p className={`mt-1 text-3xl font-semibold tracking-tight tabular-nums ${balance < 0 ? 'text-sri-fail' : 'text-ink-1'}`}>
                            {account ? money(balance) : '—'}
                        </p>
                    </div>
                </section>

                <section className="min-w-0 rounded-xl border border-line bg-surface p-4 lg:p-6">
                    <MovementsSection sourceType="bank_account" sourceId={Number(id)} onChanged={fetchAccount} />
                </section>
            </div>

            {isEditing && account && (
                <BankAccountFormModal
                    account={account}
                    onClose={() => setIsEditing(false)}
                    onSaved={() => { setIsEditing(false); fetchAccount(); }}
                />
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmation}
                title="¿Eliminar esta cuenta bancaria?"
                sutTitle="Solo se puede eliminar si el saldo está en cero. Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default PageBankAccount;
