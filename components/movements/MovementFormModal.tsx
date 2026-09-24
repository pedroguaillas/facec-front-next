"use client";

import { useState } from "react";
import { Modal, PrimaryButton, SelectOption, TextInput, FileDropInput } from "@/components";
import { SelectBankAccount } from "@/components/selects/bank-account/SelectBankAccount";
import { movementTypeOptions, paymentMethodOptions } from "@/constants";
import { depositSchema, withdrawSchema, transferSchema, otherMovementSchema } from "@/schemas/movement.schema";
import { storeDeposit, storeWithdraw, storeTransfer, storeOtherMovement } from "@/services/movementServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { MovementSourceType, MovementType, PaymentMethod } from "@/types";
import { FaFileInvoice } from "react-icons/fa";

type Operation = 'deposit' | 'withdraw' | 'transfer' | 'other';

interface Props {
    sourceType: MovementSourceType;
    sourceId: number;
    onClose: () => void;
    onSaved: () => void;
}

export const MovementFormModal = ({ sourceType, sourceId, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const availableOperations: Operation[] = sourceType === 'cash_register_session'
        ? ['deposit', 'withdraw', 'other']
        : ['transfer', 'other'];

    const operationLabels: Record<Operation, string> = {
        deposit: 'Depósito',
        withdraw: 'Retiro',
        transfer: 'Transferencia',
        other: 'Otro',
    };

    const [operation, setOperation] = useState<Operation>(availableOperations[0]);
    const [bankAccountId, setBankAccountId] = useState<number | ''>('');
    const [movementType, setMovementType] = useState<MovementType>('INGRESO');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [description, setDescription] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const commonFields = {
        date: date || undefined,
        payment_method: paymentMethod,
        receipt_number: receiptNumber || undefined,
        description: description || undefined,
    };

    const buildFormData = (data: Record<string, unknown>) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) formData.append(key, String(value));
        });
        if (receipt) formData.append('receipt', receipt);
        return formData;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        let response;

        if (operation === 'deposit') {
            const parsed = depositSchema.safeParse({
                cash_register_session_id: sourceId,
                bank_account_id: bankAccountId,
                amount,
                ...commonFields,
            });
            if (!parsed.success) return setErrors(parseZodErrors(parsed.error));
            setIsSaving(true);
            response = await storeDeposit(axiosAuth, buildFormData(parsed.data));
        } else if (operation === 'withdraw') {
            const parsed = withdrawSchema.safeParse({
                bank_account_id: bankAccountId,
                cash_register_session_id: sourceId,
                amount,
                ...commonFields,
            });
            if (!parsed.success) return setErrors(parseZodErrors(parsed.error));
            setIsSaving(true);
            response = await storeWithdraw(axiosAuth, buildFormData(parsed.data));
        } else if (operation === 'transfer') {
            const parsed = transferSchema.safeParse({
                origin_bank_account_id: sourceId,
                destination_bank_account_id: bankAccountId,
                amount,
                ...commonFields,
            });
            if (!parsed.success) return setErrors(parseZodErrors(parsed.error));
            setIsSaving(true);
            response = await storeTransfer(axiosAuth, buildFormData(parsed.data));
        } else {
            const parsed = otherMovementSchema.safeParse({
                source_type: sourceType,
                source_id: sourceId,
                type: movementType,
                amount,
                ...commonFields,
            });
            if (!parsed.success) return setErrors(parseZodErrors(parsed.error));
            setIsSaving(true);
            response = await storeOtherMovement(axiosAuth, buildFormData(parsed.data));
        }

        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }
        if (response.error) {
            setErrors({ amount: response.error });
            return;
        }

        onSaved();
    };

    return (
        <Modal isOpen title="Nuevo movimiento" onClose={onClose} modalSize="sm">
            <form onSubmit={handleSubmit}>
                <SelectOption
                    label="Operación"
                    name="operation"
                    options={availableOperations.map(op => ({ value: op, label: operationLabels[op] }))}
                    selectedValue={operation}
                    handleSelect={(e) => setOperation(e.target.value as Operation)}
                />

                {(operation === 'deposit' || operation === 'withdraw') && (
                    <SelectBankAccount
                        label={operation === 'deposit' ? 'Cuenta bancaria destino' : 'Cuenta bancaria origen'}
                        name="bank_account_id"
                        selectedValue={bankAccountId}
                        error={errors.bank_account_id}
                        handleSelect={(e) => setBankAccountId(Number(e.target.value))}
                    />
                )}

                {operation === 'transfer' && (
                    <SelectBankAccount
                        label="Cuenta destino"
                        name="destination_bank_account_id"
                        selectedValue={bankAccountId}
                        error={errors.destination_bank_account_id}
                        excludeId={sourceId}
                        handleSelect={(e) => setBankAccountId(Number(e.target.value))}
                    />
                )}

                {operation === 'other' && (
                    <SelectOption
                        label="Tipo"
                        name="type"
                        options={movementTypeOptions}
                        selectedValue={movementType}
                        handleSelect={(e) => setMovementType(e.target.value as MovementType)}
                    />
                )}

                <TextInput type="number" label="Monto" name="amount" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} required />
                <TextInput type="date" label="Fecha" name="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <SelectOption
                    label="Método de pago"
                    name="payment_method"
                    options={paymentMethodOptions}
                    selectedValue={paymentMethod}
                    handleSelect={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                />
                <TextInput type="text" label="Número de comprobante" name="receipt_number" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} maxLength={50} />
                <TextInput type="text" label="Descripción" name="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
                <FileDropInput
                    name="receipt"
                    label="Comprobante (PDF o imagen)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    file={receipt}
                    icon={<FaFileInvoice />}
                    onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                    onClear={() => setReceipt(null)}
                />

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Guardar' type='submit' action='store' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
