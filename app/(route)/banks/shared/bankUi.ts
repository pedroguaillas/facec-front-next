import { bankAccountTypeOptions } from "@/constants";
import { BankAccountType } from "@/types";

export const money = (value: number | string) =>
    Number(value ?? 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });

export const accountTypeLabel = (type: BankAccountType) =>
    bankAccountTypeOptions.find(it => it.value === type)?.label ?? type;

// Número en bloques de 4, como en la libreta, para leerlo y dictarlo sin perderse
export const groupDigits = (accountNumber: string) =>
    accountNumber.replace(/\s+/g, '').replace(/(.{4})(?=.)/g, '$1 ');
