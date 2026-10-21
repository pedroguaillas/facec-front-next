'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const message = params.get('message') ?? 'Ocurrió un error inesperado.';

  const handleGoBack = () => {
    router.back(); // 🔙 Regresa a la página anterior
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center text-center p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Error</h1>
      <p className="text-lg text-gray-700 mb-6">{message}</p>

      <button
        onClick={handleGoBack}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Regresar atrás
      </button>
    </div>
  );
}
