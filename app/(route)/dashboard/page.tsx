import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Tu archivo de config de auth
import getAxiosAuthServer from "@/lib/axios/getAxiosAuthServer";
import { BalanceChart } from "./components/BalanceChart";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import { StatCard } from "./components/StatCard";
import { FaCar, FaClock, FaFileCirclePlus, FaUserAstronaut, FaUsers } from "react-icons/fa6";
import { redirect } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";
import { DashboardResponse } from "@/types";

const InvoicesPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  const axiosAuth = getAxiosAuthServer(session);
  const { data } = await axiosAuth.get<DashboardResponse>("/dashboard");

  const isCertExpired = !!data.certExpiration && new Date(data.certExpiration) < new Date();
  const isCertSoonToExpire = !!data.certExpiration && !isCertExpired
    && (new Date(data.certExpiration).getTime() - Date.now()) < (7 * 24 * 60 * 60 * 1000);

  return (
    <div className="dark:text-gray-300 p-6 space-y-6">

      {/* Alerta de cuenta inactiva */}
      {!data.active && (
        <div className="rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 bg-red-500/90 border border-red-400 text-white backdrop-blur-sm">
          <div className="flex-grow text-center sm:text-left">
            <div className="text-4xl shrink-0 mb-2"><FaExclamationTriangle /></div>
            <h3 className="text-xl font-bold">Tu cuenta está inactiva</h3>
            {data.expired && (
              <p className="text-white/80 mt-1">
                Venció el {new Date(data.expired).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}.
              </p>
            )}
          </div>
        </div>
      )}

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
                : `Tu firma caduca el ${new Date(data.certExpiration!).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
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
        <StatCard
          icon={<FaFileCirclePlus />}
          value={data.counts.orders}
          label="Ventas"
          accent="var(--color-primary)"
          accentSoft="rgba(0, 92, 103, 0.12)"
        />
        <StatCard
          icon={<FaCar />}
          value={data.counts.shops}
          label="Compras"
          accent="#475569"
          accentSoft="rgba(71, 85, 105, 0.12)"
        />
        <StatCard
          icon={<FaUsers />}
          value={data.counts.customers}
          label="Clientes"
          accent="var(--color-success)"
          accentSoft="rgba(14, 159, 110, 0.12)"
          newThisMonth={data.newThisMonth.customers}
        />
        <StatCard
          icon={<FaUserAstronaut />}
          value={data.counts.providers}
          label="Proveedores"
          accent="#d97706"
          accentSoft="rgba(217, 119, 6, 0.12)"
          newThisMonth={data.newThisMonth.providers}
        />
      </div>

      {/* Balance */}
      <BalanceChart income={data.income} expenses={data.expenses} />

      {/* Ventas recientes */}
      <RecentOrdersTable orders={data.recentOrders} />

    </div>
  );
};

export default InvoicesPage;
