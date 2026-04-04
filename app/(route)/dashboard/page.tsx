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
  const isCertSoonToExpire = !isCertExpired && (new Date(data.cert_expiration).getTime() - Date.now()) < (7 * 24 * 60 * 60 * 1000);

  return (
    <div className="dark:text-gray-300 p-6 space-y-6">

      {/* Alerta de Certificado */}
      {(isCertExpired || isCertSoonToExpire) && (
        <div className={`
          rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4
          ${isCertExpired ? 'bg-red-500/90 border-red-400' : 'bg-yellow-500/90 border-yellow-400'}
          text-white border backdrop-blur-sm
        `}>
          <div className="flex-grow text-center sm:text-left">
            <div className="text-4xl shrink-0 mb-2">
              {isCertExpired ? <FaExclamationTriangle /> : <FaClock />}
            </div>
            <h3 className="text-xl font-bold">
              {isCertExpired ? 'Tu Firma Electrónica ha Caducado' : 'Tu Firma está por Caducar'}
            </h3>
            <p className="text-white/80 mt-1">
              {isCertExpired
                ? 'Para continuar emitiendo documentos, es necesario que la renueves.'
                : `Tu firma caduca el ${new Date(data.cert_expiration).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
            </p>
            <a
              href="https://www.facec.ec/firma-electronica"
              className="mt-3 inline-block bg-white text-gray-900 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors duration-150"
            >
              Renovar Ahora
            </a>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <article className="rounded-xl p-6 bg-gradient-to-br from-sky-500 to-sky-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-lg">
              <FaFileCirclePlus />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{data.count_orders}</h2>
          <p className="text-sky-100 text-sm mt-1">Ventas</p>
        </article>

        <article className="rounded-xl p-6 bg-gradient-to-br from-blue-800 to-blue-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-lg">
              <FaCar />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{data.count_shops}</h2>
          <p className="text-blue-200 text-sm mt-1">Compras</p>
        </article>

        <article className="rounded-xl p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-lg">
              <FaUsers />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{data.count_customers}</h2>
          <p className="text-emerald-100 text-sm mt-1">Clientes</p>
        </article>

        {!(isCertExpired || isCertSoonToExpire) &&
          <article className="rounded-xl p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-lg">
                <FaUserAstronaut />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{data.count_providers}</h2>
            <p className="text-red-100 text-sm mt-1">Proveedores</p>
          </article>
        }
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        <ReportChartMonth items={data.orders} color="#4e4376" title="Ventas" />
        <ReportChartMonth items={data.shops} color="#2FA4E7" title="Compras" />
      </div>

    </div>
  );
};

export default InvoicesPage;
