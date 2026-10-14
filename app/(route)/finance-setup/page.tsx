"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaBuildingColumns, FaCheck, FaMoneyBill1Wave, FaPlus, FaSpinner } from "react-icons/fa6";
import { AmountInput } from "@/components/movements/AmountInput";
import { markFinanceSetupDone } from "@/components/finance-setup/FinanceSetupGate";
import { BankAccountFormModal } from "../banks/shared/BankAccountFormModal";
import { accountTypeLabel, groupDigits, money } from "../banks/shared/bankUi";
import { getAllCashRegisters, storeCashRegister } from "@/services/cashRegisterServices";
import { getAllBankAccounts } from "@/services/bankAccountServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useToast } from "@/context/ToastContext";
import { BankAccountProps } from "@/types";

type Step = 1 | 2 | 3;

const steps: { id: Step; label: string }[] = [
    { id: 1, label: 'Efectivo' },
    { id: 2, label: 'Bancos' },
    { id: 3, label: 'Listo' },
];

// Asistente al activar el plan Financiero: el punto de partida del dinero del negocio (efectivo + bancos)
const FinanceSetupPage = () => {

    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { status } = useSession();
    const [step, setStep] = useState<Step>(1);
    const [isLoading, setIsLoading] = useState(true);
    // Efectivo ya registrado (caja general) o null si falta
    const [cash, setCash] = useState<number | null>(null);
    const [cashInput, setCashInput] = useState('');
    const [cashError, setCashError] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    const [accounts, setAccounts] = useState<BankAccountProps[]>([]);
    const [isAddingBank, setIsAddingBank] = useState(false);

    const loadAccounts = () =>
        getAllBankAccounts(axiosAuth).then(({ data }) => { if (data) setAccounts(data.data); });

    useEffect(() => {
        if (status !== 'authenticated') return;
        Promise.all([getAllCashRegisters(axiosAuth), getAllBankAccounts(axiosAuth)]).then(([registers, banks]) => {
            const general = registers.data?.data.find(register => register.atts.type === 'GENERAL');
            if (general) {
                markFinanceSetupDone();
                setCash(Number(general.active_session?.atts.current_balance ?? 0));
                setStep(2);
            }
            if (banks.data) setAccounts(banks.data.data);
            setIsLoading(false);
        });
    }, [axiosAuth, status]);

    const saveCash = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = cashInput === '' ? NaN : Number(cashInput);
        if (Number.isNaN(amount) || amount < 0) {
            setCashError('Escribe cuánto efectivo tienes. Si no tienes, pon 0.');
            return;
        }
        setIsSaving(true);
        // Caja siempre abierta (uses_sessions false por defecto); el responsable es el usuario actual
        const { data, error, errors } = await storeCashRegister(axiosAuth, {
            name: 'Caja general',
            type: 'GENERAL',
            uses_sessions: false,
            initial_balance: amount,
        });
        setIsSaving(false);
        if (!data) {
            setCashError(errors ? Object.values(errors)[0] : error ?? 'No se pudo guardar');
            return;
        }
        markFinanceSetupDone();
        setCash(amount);
        setStep(2);
    };

    const bankTotal = accounts.reduce((sum, account) => sum + Number(account.atts.balance ?? 0), 0);
    const total = (cash ?? 0) + bankTotal;

    if (isLoading) {
        return <p className="m-8 text-sm text-ink-3">Cargando…</p>;
    }

    return (
        <div className="px-4 py-8 md:py-12">
            <div className="mx-auto w-full max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink">Plan Financiero</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-1">¿Con cuánto dinero arranca tu negocio hoy?</h1>
                <p className="mt-2 text-sm text-ink-2">
                    Es tu punto de partida. Desde aquí, cada venta, compra y pago suma o resta, y siempre sabrás cuánto tienes y dónde.
                </p>

                {/* Pasos */}
                <ol className="mt-6 flex items-center gap-2" aria-label="Pasos">
                    {steps.map((item, index) => {
                        const state = item.id < step ? 'done' : item.id === step ? 'current' : 'next';
                        return (
                            <li key={item.id} className="flex items-center gap-2 flex-1 last:flex-none">
                                <span
                                    aria-current={state === 'current' ? 'step' : undefined}
                                    className={`flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-xs font-semibold ${state === 'done' ? 'bg-sri-ok text-white' : state === 'current' ? 'bg-primary text-white' : 'bg-surface-sunken text-ink-3 border border-line'}`}
                                >
                                    {state === 'done' ? <FaCheck aria-hidden="true" /> : item.id}
                                </span>
                                <span className={`text-sm ${state === 'current' ? 'font-medium text-ink-1' : 'text-ink-3'}`}>{item.label}</span>
                                {index < steps.length - 1 && <span className="flex-1 h-px bg-line-strong" aria-hidden="true" />}
                            </li>
                        );
                    })}
                </ol>

                {/* Saldo que se va armando */}
                <div className="mt-6 flex items-baseline justify-between rounded-xl border border-line bg-surface-sunken px-4 py-3">
                    <span className="text-sm text-ink-2">Tu dinero hoy</span>
                    <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink-1">{money(step === 1 ? Number(cashInput || 0) + bankTotal : total)}</span>
                </div>

                <div className="mt-4 rounded-xl border border-line bg-surface p-5 lg:p-6">
                    {step === 1 && (
                        <form onSubmit={saveCash} noValidate>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-soft text-brand-ink"><FaMoneyBill1Wave aria-hidden="true" /></span>
                                <div>
                                    <h2 className="font-semibold text-ink-1">Efectivo</h2>
                                    <p className="text-sm text-ink-3">Billetes y monedas que tiene el negocio ahora mismo.</p>
                                </div>
                            </div>
                            <AmountInput
                                id="setup-cash"
                                label="¿Cuánto efectivo tienes hoy?"
                                value={cashInput}
                                error={cashError}
                                onChange={value => { setCashInput(value); setCashError(undefined); }}
                                autoFocus
                            />
                            <p className="text-xs text-ink-3">Cuenta la caja y escribe el total. Si no tienes efectivo, pon 0. Se guarda en tu <strong className="font-medium text-ink-2">Caja general</strong>.</p>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaryhover disabled:opacity-60 cursor-pointer"
                            >
                                {isSaving && <FaSpinner className="animate-spin" aria-hidden="true" />}
                                {isSaving ? 'Guardando…' : 'Guardar y seguir'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-soft text-brand-ink"><FaBuildingColumns aria-hidden="true" /></span>
                                <div>
                                    <h2 className="font-semibold text-ink-1">Bancos</h2>
                                    <p className="text-sm text-ink-3">Agrega cada cuenta con el saldo que ves hoy en tu banca en línea.</p>
                                </div>
                            </div>

                            {accounts.length > 0 && (
                                <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
                                    {accounts.map(account => (
                                        <li key={account.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                                            <span className="min-w-0">
                                                <span className="block font-medium text-ink-1 truncate">{account.bank?.name}</span>
                                                <span className="block font-mono text-xs text-ink-3">{groupDigits(account.atts.account_number)} · {accountTypeLabel(account.atts.type)}</span>
                                            </span>
                                            <span className="tabular-nums font-medium text-ink-1">{money(account.atts.balance)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsAddingBank(true)}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong py-2.5 text-sm font-medium text-ink-2 hover:border-brand-ink hover:text-brand-ink hover:bg-brand-soft cursor-pointer transition-colors"
                            >
                                <FaPlus className="text-xs" aria-hidden="true" />
                                {accounts.length === 0 ? 'Agregar cuenta bancaria' : 'Agregar otra cuenta'}
                            </button>

                            <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
                                {accounts.length === 0 ? (
                                    <button type="button" onClick={() => setStep(3)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-ink-2 hover:text-ink-1 cursor-pointer">
                                        No uso banco
                                    </button>
                                ) : <span />}
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    disabled={accounts.length === 0}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primaryhover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="font-semibold text-ink-1">¡Listo! Este es tu punto de partida</h2>
                            <dl className="mt-3 space-y-1.5 text-sm">
                                <div className="flex justify-between"><dt className="text-ink-2">Efectivo</dt><dd className="tabular-nums text-ink-1">{money(cash ?? 0)}</dd></div>
                                {accounts.map(account => (
                                    <div key={account.id} className="flex justify-between gap-3">
                                        <dt className="text-ink-2 truncate">{account.bank?.name} •{account.atts.account_number.slice(-4)}</dt>
                                        <dd className="tabular-nums text-ink-1">{money(account.atts.balance)}</dd>
                                    </div>
                                ))}
                            </dl>
                            <ul className="mt-5 space-y-2 text-sm text-ink-2">
                                <li className="flex gap-2"><FaCheck className="mt-1 shrink-0 text-xs text-sri-ok" aria-hidden="true" />En cada venta de contado eliges si el dinero entró a la caja o al banco.</li>
                                <li className="flex gap-2"><FaCheck className="mt-1 shrink-0 text-xs text-sri-ok" aria-hidden="true" />Lo que vendes a crédito queda en <strong className="font-medium text-ink-1">quién te debe</strong> hasta que te paguen.</li>
                                <li className="flex gap-2"><FaCheck className="mt-1 shrink-0 text-xs text-sri-ok" aria-hidden="true" />En <strong className="font-medium text-ink-1">Movimientos</strong> ves todo lo que entra y sale, mes a mes.</li>
                            </ul>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaryhover cursor-pointer"
                            >
                                Ir a mi resumen
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isAddingBank && (
                <BankAccountFormModal
                    account={null}
                    onClose={() => setIsAddingBank(false)}
                    onSaved={() => {
                        setIsAddingBank(false);
                        toast('Cuenta agregada');
                        loadAccounts();
                    }}
                />
            )}
        </div>
    );
};

export default FinanceSetupPage;
