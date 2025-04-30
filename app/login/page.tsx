// app/login/page.tsx
"use client";

import { PrimaryButton, TextInput } from "@/components";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    const result = await signIn("credentials", {
      user,
      password,
      redirect: false, // Prevent automatic redirect
    });

    setIsLoading(true);
    
    if (result?.error) {
      setError("Credenciales incorrecto");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      // window.location.href = "/dashboard"; // Redirect on success
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center dark:text-primary">
        fac
        <span className="text-slate-400 font-semibold">ec</span>
      </h1>
      <p className="text-slate-500 my-4">Ingresa a tu cuenta</p>
      <form onSubmit={handleSubmit}>
        <TextInput
          value={user}
          onChange={handleChange}
          label="Usuario"
          name="user"
        />
        <TextInput
          type="password"
          value={password}
          onChange={handlePasswordChange}
          label="Contraseña"
          name="password"
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="mt-6">
          <PrimaryButton
            label="Ingresar"
            type="submit"
            isLoading={isLoading}
            action="store"
          />
        </div>
      </form>
    </>
  );
}