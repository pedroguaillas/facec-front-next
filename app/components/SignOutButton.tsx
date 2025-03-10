"use client"; // ✅ Indica que este componente es del lado del cliente

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Cerrar sesión
    </button>
  );
}
