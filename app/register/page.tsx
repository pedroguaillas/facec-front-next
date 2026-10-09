"use client";

import { PrimaryButton, TextInput } from "@/components";
import { parseZodErrors } from "@/helpers/zodHelper";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCircleCheck, FaSpinner } from "react-icons/fa6";
import { RegisterPayload, registerSchema } from "@/schemas/register.schema";
import { lookupRegisterRuc, registerCompany } from "@/services/registerServices";
import { TRIAL_LABEL } from "@/constants/register";
import { ResendVerification } from "@/components/resend-verification/ResendVerification";
import { RegisterSteps } from "./RegisterSteps";

const initialForm: RegisterPayload = {
    ruc: '',
    address: '',
    phone: '',
    user: '',
    email: '',
    password: '',
    password_confirmation: '',
};

export default function RegisterPage() {
    const [form, setForm] = useState<RegisterPayload>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<string>();
    const [registered, setRegistered] = useState<{ message: string; email: string }>();
    // Razón social del SRI al completar el RUC
    const [company, setCompany] = useState('');
    const [isLookingUp, setIsLookingUp] = useState(false);

    useEffect(() => {
        setCompany('');
        if (form.ruc.length !== 13) {
            setIsLookingUp(false);
            return;
        }

        let cancelled = false;
        setIsLookingUp(true);
        lookupRegisterRuc(form.ruc).then(({ data, errors: lookupErrors }) => {
            if (cancelled) return;
            setIsLookingUp(false);
            if (data) {
                setCompany(data.company);
            } else if (lookupErrors?.ruc) {
                // Ya registrado / no existe en el SRI. Si el SRI no responde se deja enviar y decide el backend
                setErrors(prev => ({ ...prev, ruc: lookupErrors.ruc }));
            }
        });

        return () => { cancelled = true; };
    }, [form.ruc]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'ruc' ? value.replace(/\D/g, '').slice(0, 13) : value }));
        setErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(undefined);

        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsPending(true);
        const res = await registerCompany({ ...parsed.data, phone: parsed.data.phone || undefined });
        setIsPending(false);

        if (res.errors) {
            setErrors(res.errors);
            return;
        }
        if (res.error || !res.data) {
            setMessage(res.error ?? 'No se pudo completar el registro');
            return;
        }

        setRegistered({ message: res.data.message, email: res.data.email });
    };

    if (registered) {
        return (
            <>
                <RegisterSteps current={1} />
                <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center text-center">
                    <Brand />
                    <h1 className="mt-4 lg:mt-0 text-lg lg:text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Revisa tu correo</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{registered.message}</p>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                        Enviamos el enlace a <span className="font-medium text-slate-800 dark:text-slate-200">{registered.email}</span>. Vence en 24 horas.
                    </p>
                    <div className="mt-6">
                        <ResendVerification user={form.user} />
                    </div>
                    <Link href="/login" className="block mt-4 text-sm text-primary hover:underline">
                        Ir a iniciar sesión
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <RegisterSteps current={0} />
            <div className="p-6 sm:p-8 lg:p-10">
                <Brand />
                <h1 className="mt-4 lg:mt-0 text-lg lg:text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Crea tu cuenta</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Registra tu empresa y factura electrónicamente: {TRIAL_LABEL}.
                </p>

                <form onSubmit={onSubmit} noValidate className="mt-4">
                    <SectionTitle>Tu empresa</SectionTitle>
                    {/* En computadora: RUC | Teléfono, y la dirección a todo el ancho */}
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-4">
                        <div className="lg:order-1">
                            <TextInput
                                label="RUC"
                                name="ruc"
                                value={form.ruc}
                                error={errors.ruc}
                                onChange={handleChange}
                                inputMode="numeric"
                                maxLength={13}
                                showCount
                                hint="Buscamos tu razón social en el SRI"
                                autoFocus
                                required
                            />
                        </div>
                        {(isLookingUp || company) && (
                            <div className="lg:order-3 lg:col-span-2">
                                <TextInput
                                    label="Razón social"
                                    name="company"
                                    value={isLookingUp ? 'Consultando el SRI…' : company}
                                    onChange={() => undefined}
                                    readOnly
                                    endAdornment={isLookingUp
                                        ? <FaSpinner className="animate-spin text-slate-400" aria-hidden="true" />
                                        : <FaCircleCheck className="text-sri-ok" aria-label="Encontrado en el SRI" />}
                                />
                            </div>
                        )}
                        <div className="lg:order-4 lg:col-span-2">
                            <TextInput
                                label="Dirección del establecimiento"
                                name="address"
                                value={form.address}
                                error={errors.address}
                                onChange={handleChange}
                                maxLength={300}
                                autoComplete="street-address"
                                required
                            />
                        </div>
                        <div className="lg:order-2">
                            <TextInput
                                type="tel"
                                label="Teléfono"
                                name="phone"
                                value={form.phone ?? ''}
                                error={errors.phone}
                                onChange={handleChange}
                                inputMode="tel"
                                maxLength={20}
                                autoComplete="tel"
                            />
                        </div>
                    </div>

                    <SectionTitle>Tu acceso</SectionTitle>
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-4">
                        <TextInput
                            label="Usuario"
                            name="user"
                            value={form.user}
                            error={errors.user}
                            onChange={handleChange}
                            maxLength={50}
                            hint="Letras, números, guion o guion bajo"
                            autoComplete="username"
                            required
                        />
                        <TextInput
                            type="email"
                            label="Correo"
                            name="email"
                            value={form.email}
                            error={errors.email}
                            onChange={handleChange}
                            inputMode="email"
                            autoComplete="email"
                            hint="Te enviaremos un enlace para confirmarlo"
                            required
                        />
                    </div>
                    <div className="sm:grid sm:grid-cols-2 sm:gap-x-4">
                        <TextInput
                            type="password"
                            label="Contraseña"
                            name="password"
                            value={form.password}
                            error={errors.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            hint="Mínimo 8 caracteres"
                            required
                        />
                        <TextInput
                            type="password"
                            label="Confirmar"
                            name="password_confirmation"
                            value={form.password_confirmation}
                            error={errors.password_confirmation}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {message && <p className="text-sm text-red-500 mt-2" role="alert">{message}</p>}

                    <div className="mt-6">
                        <PrimaryButton label="Crear cuenta" type="submit" isLoading={isPending} action="login" />
                    </div>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
                </p>
            </div>
        </>
    );
}

// En computadora la marca va en el panel lateral
const Brand = () => (
    <div className="lg:hidden bg-gradient-to-r from-sky-300 to-sky-900 bg-clip-text text-transparent font-semibold text-4xl text-center">
        facec
    </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <p className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</p>
);
