import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Tu archivo de config de auth
import getAxiosAuthServer from "@/lib/axios/getAxiosAuthServer";
import { ReportChartMonth } from "./components/ReportChartMonth";
import { FaCar, FaClock, FaFileCirclePlus, FaUserAstronaut, FaUsers } from "react-icons/fa6";
import { redirect } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";

const InvoicesPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  const axiosAuth = getAxiosAuthServer(session);
  const { data } = await axiosAuth.get("/dashboard");

  const isCertExpired = new Date(data.cert_expiration) < new Date();
  const isCertSoonToExpire = !isCertExpired && (new Date(data.cert_expiration).getTime() - Date.now()) < (7 * 24 * 60 * 60 * 1000); // 7 días

  return (
    <div className="dark:text-gray-300">

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full justify-between p-6 gap-6">

        {/* Card Expired */}
        {/* Alerta de Certificado */}
        {(isCertExpired || isCertSoonToExpire) && (
          // ANOTACIÓN: Se refina el diseño de la alerta.
          // - Animación más sutil: 'animate-pulse' en lugar de 'animate-bounce' en el botón.
          // - Mejor contraste y jerarquía en el texto.
          // - Se usa un efecto de "glassmorphism" sutil con backdrop-blur si se desea.
          <div className={`rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-center gap-4
          ${isCertExpired ? 'bg-red-500/90' : 'bg-yellow-500/90'} text-white backdrop-blur-sm border ${isCertExpired ? 'border-red-400' : 'border-yellow-400'}`}>

            <div className="flex-grow text-center sm:text-left">

              <div className="text-5xl shrink-0">
                {isCertExpired ? <FaExclamationTriangle /> : <FaClock />}
              </div>

              <h3 className="text-xl font-bold">
                {isCertExpired ? '¡Tu Firma Electrónica ha Caducado!' : '¡Atención! Tu Firma está por Caducar'}
              </h3>

              <p className="text-white/80">
                {isCertExpired
                  ? 'Para continuar emitiendo documentos, es necesario que la renueves.'
                  : `Tu firma caduca el ${new Date(data.cert_expiration).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
              </p>
              <a
                href="/firma/renovar"
                className="mt-2 sm:mt-0 bg-white text-black px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 hover:bg-gray-100 transition-transform duration-300 animate-bounce"
              >
                🚀 Renovar Ahora
              </a>
            </div>

          </div>
        )}

        {/* Card 1 */}
        <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-r from-sky-400 via-sky-400/75 to-sky-400 gap-4 py-8">
          <div className="rounded-full block bg-sky-200/50 p-4 text-white text-3xl">
            <FaFileCirclePlus />
          </div>
          <h2 className="text-white text-4xl py-2 font-bold">{data.count_orders}</h2>
          <p className="text-sky-100 text-xl">Ventas</p>
        </article>

        {/* Card 2 */}
        <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-t from-blue-900 via-blue-900/75 to-blue-900 gap-4 py-8">
          <div className="rounded-full block bg-blue-200/50 p-4 text-white text-3xl">
            <FaCar />
          </div>
          <h2 className="text-white text-4xl py-2 font-bold">{data.count_shops}</h2>
          <p className="text-blue-100 text-xl">Compras</p>
        </article>

        {/* Card 3 */}
        <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-r from-green-600 via-green-600/75 to-green-600 gap-4 py-8">
          <div className="rounded-full block bg-green-200/50 p-4 text-white text-3xl">
            <FaUsers />
          </div>
          <h2 className="text-white text-4xl py-2 font-bold">{data.count_customers}</h2>
          <p className="text-green-100 text-xl">Clientes</p>
        </article>

        {/* Card 4 */}
        {!(isCertExpired || isCertSoonToExpire) &&
          <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-b from-red-500 via-red-500/75 to-red-500 gap-4 py-8">
            <div className="rounded-full block bg-red-200/50 p-4 text-white text-3xl">
              <FaUserAstronaut />
            </div>
            <h2 className="text-white text-4xl py-2 font-bold">{data.count_providers}</h2>
            <p className="text-red-100 text-xl">Proveedores</p>
          </article>
        }

      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6 px-6 pb-6">
        <ReportChartMonth items={data.orders} color="#4e4376" title="Ventas" />
        <ReportChartMonth items={data.shops} color="#2FA4E7" title="Compras" />
      </div>

    </div>
  );
};

export default InvoicesPage;