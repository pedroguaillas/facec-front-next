"use client";

import Link from "next/link";
import { PrimaryButton } from "@/components";
import { FaChevronRight } from "react-icons/fa6";
import { useBanks } from "../context/BanksContext";
import { accountTypeLabel, groupDigits, money } from "../shared/bankUi";

interface Props {
    onCreate: () => void;
}

// Una fila por cuenta: banco | cuenta | saldo. Toda la fila lleva al detalle (movimientos, editar, eliminar)
export const BankAccountsList = ({ onCreate }: Props) => {

    const { accounts, isLoading } = useBanks();
    const total = accounts.reduce((sum, account) => sum + Number(account.atts.balance ?? 0), 0);

    if (isLoading) {
        return <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-3">Cargando cuentas…</div>;
    }

    if (accounts.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center">
                <p className="font-medium text-ink-1">Aún no registras cuentas bancarias</p>
                <p className="mt-1 text-sm text-ink-3">Agrega tu cuenta para cobrar y pagar por transferencia y ver su saldo al día.</p>
                <div className="mx-auto mt-4 w-44">
                    <PrimaryButton label="Agregar cuenta" type="button" action="add" onClick={onCreate} />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-line bg-surface overflow-hidden">
            {/* Encabezado solo en pantallas medianas en adelante */}
            <div className="hidden md:grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_8rem_1.5rem] gap-4 px-5 py-2.5 border-b border-line bg-surface-sunken text-xs font-medium uppercase tracking-wide text-ink-3">
                <span>Banco</span>
                <span>Cuenta</span>
                <span className="text-right">Saldo</span>
                <span />
            </div>

            <ul className="divide-y divide-line">
                {accounts.map(account => {
                    const balance = Number(account.atts.balance ?? 0);
                    return (
                        <li key={account.id}>
                            <Link
                                href={`/banks/${account.id}`}
                                className="group grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_8rem_1.5rem] items-center gap-x-4 gap-y-0.5 px-4 md:px-5 py-3 hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none transition-colors"
                            >
                                <span className="font-medium text-ink-1 truncate">{account.bank?.name ?? '—'}</span>
                                <span className={`md:order-3 text-right font-semibold tabular-nums ${balance < 0 ? 'text-sri-fail' : 'text-ink-1'}`}>
                                    {money(balance)}
                                </span>
                                <span className="md:order-2 col-span-2 md:col-span-1 flex items-baseline gap-2 min-w-0 text-sm">
                                    <span className="font-mono tabular-nums text-ink-2 truncate">{groupDigits(account.atts.account_number)}</span>
                                    <span className="shrink-0 text-xs text-ink-3">{accountTypeLabel(account.atts.type)}</span>
                                </span>
                                <FaChevronRight aria-hidden="true" className="hidden md:block md:order-4 justify-self-end text-xs text-ink-4 group-hover:text-ink-2" />
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="flex items-baseline justify-between gap-4 px-4 md:px-5 py-3 border-t border-line bg-surface-sunken">
                <span className="text-sm text-ink-2">Total en bancos</span>
                <span className="text-lg font-semibold tabular-nums text-ink-1 md:mr-10">{money(total)}</span>
            </div>
        </div>
    );
};
