// app/login/page.tsx
"use client";

import { PrimaryButton, TextInput } from "@/components";
import { ResendVerification } from "@/components/resend-verification/ResendVerification";
import { EMAIL_UNVERIFIED, TRIAL_DURATION } from "@/constants/register";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { LoginAside } from "./LoginAside";

// Resultado del enlace de confirmación de correo (?verified=1 | 0)
const VerifiedNotice = () => {
  const verified = useSearchParams().get('verified');
  if (verified === '1') {
    return <p className="mb-2 rounded-lg bg-sri-ok-soft px-3 py-2 text-sm text-sri-ok" role="status">Correo confirmado, ya puedes iniciar sesión.</p>;
  }
  if (verified === '0') {
    return <p className="mb-2 rounded-lg bg-sri-fail-soft px-3 py-2 text-sm text-sri-fail" role="alert">Enlace inválido o vencido. Inicia sesión para pedir uno nuevo.</p>;
  }
  return null;
};

export default function LoginPage() {

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // El usuario existe pero no confirmó su correo: se ofrece reenviarlo
  const [unverified, setUnverified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser(event.target.value);
  };

  // Maneja cambios para el campo "password"
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setUnverified(false);

    const result = await signIn("credentials", {
      user,
      password,
      redirect: false, // Prevent automatic redirect
    });

    if (result?.error) {
      if (result.error === EMAIL_UNVERIFIED) {
        setUnverified(true);
      } else {
        setError("Usuario o contraseña incorrectos");
      }
      setIsLoading(false);
    } else {
      const session = await getSession(); // 🔄 Asegura que obtienes la sesión actualizada
        if (session?.user.user.user === 'admin') {
          router.push("/admin/companies");
        } else {
          router.push("/dashboard");
        }
    }
  };

  return (
    <>
      <LoginAside />
      <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
        {/* En computadora la marca va en el panel lateral */}
        <div className="lg:hidden bg-gradient-to-r from-sky-300 to-sky-900 bg-clip-text text-transparent font-semibold text-4xl text-center">
          facec
        </div>
        <h1 className="mt-4 lg:mt-0 text-lg lg:text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Ingresa a tu cuenta</h1>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Usa el usuario y la contraseña de tu empresa.</p>

        <Suspense fallback={null}>
          <VerifiedNotice />
        </Suspense>

        <form onSubmit={handleSubmit} noValidate>
          <TextInput
            value={user}
            onChange={handleChange}
            label="Usuario"
            name="user"
            autoComplete="username"
            autoFocus
          />
          <TextInput
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            label="Contraseña"
            name="password"
            autoComplete="current-password"
            endAdornmentPadding="pr-11"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="pointer-events-auto -mr-1.5 p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary dark:text-primarywhite hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-sri-fail-soft px-3 py-2 text-sm text-sri-fail" role="alert">{error}</p>
          )}
          {unverified && (
            <div className="mt-3 rounded-lg bg-sri-wait-soft px-3 py-3 text-sm" role="alert">
              <p className="font-medium text-sri-wait">Confirma tu correo para ingresar.</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Revisa tu bandeja de entrada (y spam). Si no te llegó, te lo reenviamos.</p>
              <div className="mt-3">
                <ResendVerification user={user} />
              </div>
            </div>
          )}

          <div className="mt-6">
            <PrimaryButton
              label="Ingresar"
              type="submit"
              isLoading={isLoading}
              action="login"
            />
          </div>
        </form>

        <p className="mt-6 pt-5 border-t border-[var(--border)] text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta? <Link href="/register" className="font-medium text-primary dark:text-primarywhite hover:underline">Prueba gratis por {TRIAL_DURATION}</Link>
        </p>
      </div>
    </>
  );
}
