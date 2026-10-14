"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDropInput, SelectOption, TextInput } from "@/components";
import { FormModal } from "@/components/form-modal/FormModal";
import { AmountInput } from "@/components/movements/AmountInput";
import { paymentMethodOptions } from "@/constants";
import { CategoryOptions } from "./CategoryOptions";
import { depositSchema, otherMovementSchema, transferSchema, withdrawSchema } from "@/schemas/movement.schema";
import { storeDeposit, storeOtherMovement, storeTransfer, storeWithdraw } from "@/services/movementServices";
import { getAllBankAccounts } from "@/services/bankAccountServices";
import { getAllCashRegisters } from "@/services/cashRegisterServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import { getDate } from "@/helpers/dateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { MovementCategory, PaymentMethod } from "@/types";
import { FaFileInvoice } from "react-icons/fa";
import { FaArrowDown, FaArrowUp, FaChevronDown, FaRightLeft } from "react-icons/fa6";
import { groupDigits, money } from "../../banks/shared/bankUi";

type Mode = 'in' | 'out' | 'move';

// Cuenta o caja donde vive el dinero. En caja el movimiento va contra la sesión abierta
interface Place {
    key: string;
    kind: 'bank' | 'cash';
    id: number;
    name: string;
    balance: number;
    closed: boolean;
}

const modes: { value: Mode; label: string; hint: string; icon: React.ReactNode }[] = [
    { value: 'in', label: 'Entra dinero', hint: 'Un ingreso', icon: <FaArrowDown className="text-sri-ok" /> },
    { value: 'out', label: 'Sale dinero', hint: 'Un gasto o pago', icon: <FaArrowUp className="text-sri-fail" /> },
    { value: 'move', label: 'Mover', hint: 'Entre mis cuentas', icon: <FaRightLeft className="text-brand-ink" /> },
];

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

export const RegisterMovementModal = ({ onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [places, setPlaces] = useState<Place[] | null>(null);
    const [mode, setMode] = useState<Mode>('in');
    const [placeKey, setPlaceKey] = useState('');
    const [toKey, setToKey] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(getDate());
    const [category, setCategory] = useState<MovementCategory | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFERENCIA');
    const [description, setDescription] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    const [showReceipt, setShowReceipt] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        Promise.all([getAllBankAccounts(axiosAuth), getAllCashRegisters(axiosAuth)]).then(([banks, registers]) => {
            const bankPlaces: Place[] = (banks.data?.data ?? []).map(account => ({
                key: `bank:${account.id}`,
                kind: 'bank',
                id: account.id,
                name: `${account.bank?.name ?? 'Banco'} ${groupDigits(account.atts.account_number)}`,
                balance: Number(account.atts.balance ?? 0),
                closed: false,
            }));
            const cashPlaces: Place[] = (registers.data?.data ?? []).map(register => ({
                key: `cash:${register.id}`,
                kind: 'cash',
                id: register.active_session?.id ?? 0,
                name: `Caja ${register.atts.name}`,
                balance: Number(register.active_session?.atts.current_balance ?? 0),
                closed: !register.active_session,
            }));
            const all = [...bankPlaces, ...cashPlaces];
            setPlaces(all);
            const first = all.find(place => !place.closed);
            if (first) {
                setPlaceKey(first.key);
                setPaymentMethod(first.kind === 'bank' ? 'TRANSFERENCIA' : 'EFECTIVO');
            }
        });
    }, [axiosAuth]);

    const byKey = useMemo(() => new Map((places ?? []).map(place => [place.key, place])), [places]);
    const place = byKey.get(placeKey);
    const to = byKey.get(toKey);
    const cashToCash = mode === 'move' && place?.kind === 'cash' && to?.kind === 'cash';
    const isDirty = !!amount || !!description || !!receiptNumber || !!receipt;

    const clearError = (name: string) => setErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));

    const selectMode = (next: Mode) => {
        setMode(next);
        setCategory('');
        setToKey('');
        setErrors({});
        setMessage(undefined);
    };

    const selectPlace = (key: string) => {
        setPlaceKey(key);
        if (key === toKey) setToKey('');
        const next = byKey.get(key);
        if (next) setPaymentMethod(next.kind === 'bank' ? 'TRANSFERENCIA' : 'EFECTIVO');
        clearError('place');
    };

    const placeOptions = (exclude?: string) => (places ?? [])
        .filter(it => it.key !== exclude)
        .map(it => ({
            value: it.key,
            label: it.closed ? `${it.name} · Caja cerrada` : `${it.name} · ${money(it.balance)}`,
            disabled: it.closed,
        }));

    const buildFormData = (data: Record<string, unknown>) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') formData.append(key, String(value));
        });
        if (receipt) formData.append('receipt', receipt);
        return formData;
    };

    // Elige endpoint y esquema según el modo y el par origen/destino
    const prepare = () => {
        const common = { date, receipt_number: receiptNumber || undefined, description: description.trim() || undefined };
        if (!place) return null;

        if (mode !== 'move') {
            return {
                parsed: otherMovementSchema.safeParse({
                    source_type: place.kind === 'bank' ? 'bank_account' : 'cash_register_session',
                    source_id: place.id,
                    type: mode === 'in' ? 'INGRESO' : 'EGRESO',
                    category: category || undefined,
                    payment_method: paymentMethod,
                    amount,
                    ...common,
                }),
                store: storeOtherMovement,
            };
        }
        if (!to) return null;
        if (place.kind === 'cash') {
            return {
                parsed: depositSchema.safeParse({ cash_register_session_id: place.id, bank_account_id: to.id, amount, payment_method: 'DEPOSITO', ...common }),
                store: storeDeposit,
            };
        }
        if (to.kind === 'cash') {
            return {
                parsed: withdrawSchema.safeParse({ bank_account_id: place.id, cash_register_session_id: to.id, amount, payment_method: 'EFECTIVO', ...common }),
                store: storeWithdraw,
            };
        }
        return {
            parsed: transferSchema.safeParse({ origin_bank_account_id: place.id, destination_bank_account_id: to.id, amount, payment_method: 'TRANSFERENCIA', ...common }),
            store: storeTransfer,
        };
    };

    const handleSubmit = async () => {
        setErrors({});
        setMessage(undefined);

        if (!place) return setErrors({ place: 'Elige la cuenta o caja' });
        if (mode === 'move' && !to) return setErrors({ to: 'Elige a dónde mueves el dinero' });
        if (cashToCash) return;

        const prepared = prepare();
        if (!prepared) return;
        if (!prepared.parsed.success) {
            setErrors(parseZodErrors(prepared.parsed.error));
            return;
        }

        setIsSaving(true);
        const response = await prepared.store(axiosAuth, buildFormData(prepared.parsed.data));
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            if (response.errors.receipt || response.errors.receipt_number) setShowReceipt(true);
            return;
        }
        if (response.error) {
            setMessage(response.error);
            return;
        }
        onSaved();
    };

    const noPlaces = places !== null && places.every(it => it.closed);

    return (
        <FormModal
            title="Registrar movimiento"
            onClose={onClose}
            onSubmit={handleSubmit}
            isPending={isSaving}
            isLoading={places === null}
            isDirty={isDirty}
            message={message}
            modalSize="sm"
        >
            {noPlaces ? (
                <p className="rounded-lg border border-dashed border-line-strong p-4 text-sm text-ink-2">
                    Primero registra una cuenta bancaria o abre una caja: el movimiento tiene que salir o entrar de algún lugar.
                </p>
            ) : (
                <>
                    <fieldset>
                        <legend className="sr-only">Qué quieres registrar</legend>
                        <div className="grid grid-cols-3 gap-2">
                            {modes.map(option => {
                                const checked = mode === option.value;
                                return (
                                    <label
                                        key={option.value}
                                        className={`flex flex-col gap-1 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${checked
                                            ? 'border-primary bg-brand-soft'
                                            : 'border-line-strong hover:border-ink-4 hover:bg-surface-sunken'}`}
                                    >
                                        <input type="radio" name="mode" value={option.value} checked={checked} onChange={() => selectMode(option.value)} className="sr-only" />
                                        <span className="flex items-center gap-2 text-sm font-medium text-ink-1">
                                            <span aria-hidden="true" className="text-xs">{option.icon}</span>
                                            {option.label}
                                        </span>
                                        <span className="text-xs leading-snug text-ink-3">{option.hint}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    {/* Dónde: una cuenta, o desde → hacia al mover */}
                    <div className={mode === 'move' ? 'mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3' : 'mt-1'}>
                        <PlaceSelect
                            label={mode === 'move' ? 'Desde' : mode === 'in' ? 'Entra a' : 'Sale de'}
                            name="place"
                            value={placeKey}
                            options={placeOptions()}
                            error={errors.place}
                            onChange={selectPlace}
                        />
                        {mode === 'move' && (
                            <PlaceSelect
                                label="Hacia"
                                name="to"
                                value={toKey}
                                options={placeOptions(placeKey)}
                                error={errors.to}
                                onChange={(key) => { setToKey(key); clearError('to'); }}
                                placeholder
                            />
                        )}
                    </div>
                    {cashToCash && (
                        <p className="mb-2 rounded-lg bg-sri-wait-soft px-3 py-2 text-sm text-sri-wait" role="alert">
                            Entre cajas el dinero se mueve al cerrar una y abrir la otra. Elige un banco como origen o destino.
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_10rem] gap-x-3">
                        <AmountInput value={amount} error={errors.amount} onChange={(value) => { setAmount(value); clearError('amount'); }} />
                        <TextInput type="date" label="Fecha" name="date" value={date} error={errors.date} onChange={(e) => { setDate(e.target.value); clearError('date'); }} required />
                    </div>
                    {place && mode !== 'in' && !place.closed && (
                        <p className="-mt-1 mb-1 text-xs text-ink-3">Disponible en {place.name}: <span className="tabular-nums">{money(place.balance)}</span></p>
                    )}

                    <TextInput
                        type="text"
                        label="Concepto"
                        name="description"
                        value={description}
                        error={errors.description}
                        onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
                        placeholder={mode === 'out' ? 'Ej. Pago de luz de octubre' : mode === 'in' ? 'Ej. Préstamo del banco' : 'Ej. Depósito de las ventas del día'}
                        maxLength={300}
                    />

                    {mode !== 'move' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
                            {/* Select propio: agrupa "Del negocio" / "Dueño y préstamos" con optgroup */}
                            <div className="flex flex-col gap-1 my-2 min-w-0">
                                <label htmlFor="movement-category" className="text-sm font-medium text-ink-2">Categoría</label>
                                <select
                                    id="movement-category"
                                    name="category"
                                    value={category}
                                    onChange={(e) => { setCategory(e.target.value as MovementCategory | ''); clearError('category'); }}
                                    aria-invalid={errors.category ? 'true' : 'false'}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-[var(--background)] text-ink-1 focus:outline-none transition-colors ${errors.category ? 'border-red-400' : 'border-[var(--border-strong)] focus:border-primary'}`}
                                >
                                    <CategoryOptions type={mode === 'in' ? 'INGRESO' : 'EGRESO'} emptyLabel="Seleccione" />
                                </select>
                                {errors.category && <span className="text-sm text-red-500">{errors.category}</span>}
                            </div>
                            <SelectOption
                                label="Medio"
                                name="payment_method"
                                options={paymentMethodOptions}
                                selectedValue={paymentMethod}
                                handleSelect={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            />
                        </div>
                    )}

                    <div className="mt-3 border-t border-line pt-3">
                        <button
                            type="button"
                            onClick={() => setShowReceipt(prev => !prev)}
                            aria-expanded={showReceipt}
                            className="flex w-full items-center justify-between text-sm font-medium text-ink-2 hover:text-ink-1"
                        >
                            <span>Comprobante <span className="font-normal text-ink-3">(opcional)</span></span>
                            <FaChevronDown aria-hidden="true" className={`text-xs text-ink-3 transition-transform ${showReceipt ? 'rotate-180' : ''}`} />
                        </button>
                        {showReceipt && (
                            <div className="mt-1">
                                <TextInput type="text" label="Número de comprobante" name="receipt_number" value={receiptNumber} error={errors.receipt_number} onChange={(e) => { setReceiptNumber(e.target.value); clearError('receipt_number'); }} maxLength={50} />
                                <FileDropInput
                                    name="receipt"
                                    label="Archivo (PDF o imagen)"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    file={receipt}
                                    icon={<FaFileInvoice />}
                                    onChange={(e) => { setReceipt(e.target.files?.[0] ?? null); clearError('receipt'); }}
                                    onClear={() => setReceipt(null)}
                                />
                                {errors.receipt && <p className="text-sm text-red-500">{errors.receipt}</p>}
                            </div>
                        )}
                    </div>
                </>
            )}
        </FormModal>
    );
};

interface PlaceSelectProps {
    label: string;
    name: string;
    value: string;
    options: { value: string; label: string; disabled: boolean }[];
    error?: string;
    onChange: (key: string) => void;
    placeholder?: boolean;
}

// Select propio: SelectOption no admite opciones deshabilitadas (cajas cerradas)
const PlaceSelect = ({ label, name, value, options, error, onChange, placeholder }: PlaceSelectProps) => (
    <div className="flex flex-col gap-1 my-2 min-w-0">
        <label htmlFor={`movement-${name}`} className="text-sm font-medium text-ink-2">
            {label} <span className="text-red-500">*</span>
        </label>
        <select
            id={`movement-${name}`}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-[var(--background)] text-ink-1 focus:outline-none transition-colors ${error ? 'border-red-400' : 'border-[var(--border-strong)] focus:border-primary'}`}
        >
            {(placeholder || !value) && <option value="">Seleccione</option>}
            {options.map(option => (
                <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
            ))}
        </select>
        {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
);
