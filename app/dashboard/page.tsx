import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/app/components/SignOutButton"; // ✅ Importar el Componente Cliente

export default async function Dashboard() {
  const session = await getServerSession(authOptions); // ✅ Esto sigue en el lado del servidor

  return (
    <div>
      <h1>Dashboard</h1>
      {session ? (
        <>
          <p>Bienvenido, {session.user?.name}</p>
          <SignOutButton /> {/* ✅ Ahora el botón se maneja en el lado del cliente */}
        </>
      ) : (
        <p>No estás autenticado</p>
      )}
    </div>
  );
}
