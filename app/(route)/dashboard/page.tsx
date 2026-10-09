import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Tu archivo de config de auth
import getAxiosAuthServer from "@/lib/axios/getAxiosAuthServer";
import { BalanceChart } from "./components/BalanceChart";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import { MonthSummary } from "./components/MonthSummary";
import { RecordsPanel } from "./components/RecordsPanel";
import { SriStrip } from "./components/SriStrip";
import { OverdueCard } from "./components/OverdueCard";
import { FinancieroUpsellCard } from "./components/FinancieroUpsellCard";
import { redirect } from "next/navigation";
import { Notice } from "@/components";
import Link from "next/link";
import { DashboardResponse } from "@/types";
import { getCustomersOverdue, getProvidersOverdue } from "@/services/overdueServices";

const InvoicesPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  const axiosAuth = getAxiosAuthServer(session);
  // Plan Facturador no incluye cartera: en lugar de la cartera vencida se invita a probar el Financiero
  const isFacturador = session.user.permissions.plan === 'FACTURADOR';

  const { data } = await axiosAuth.get<DashboardResponse>("/dashboard");
  const [{ data: customersOverdue }, { data: providersOverdue }] = isFacturador
    ? [{ data: undefined }, { data: undefined }]
    : await Promise.all([
      getCustomersOverdue(axiosAuth),
      getProvidersOverdue(axiosAuth),
    ]);
  const totalOverdue = (customersOverdue?.total_overdue ?? 0) + (providersOverdue?.total_overdue ?? 0);
  const overduePartiesCount = (customersOverdue?.parties.length ?? 0) + (providersOverdue?.parties.length ?? 0);

  const isCertExpired = !!data.certExpiration && new Date(data.certExpiration) < new Date();
  const isCertSoonToExpire = !!data.certExpiration && !isCertExpired
    && (new Date(data.certExpiration).getTime() - Date.now()) < (7 * 24 * 60 * 60 * 1000);

  const formatLongDate = (date: string) =>
    new Date(date).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

  const today = new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guayaquil' });

  const cartera = isFacturador
    ? <FinancieroUpsellCard />
    : <OverdueCard totalOverdue={totalOverdue} partiesCount={overduePartiesCount} />;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 lg:space-y-6 text-ink-1">

      <header>
        <p className="text-sm text-ink-3 first-letter:uppercase">{today}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
      </header>

      {/* Avisos de la cuenta y la firma electrónica */}
      {!data.active && (
        <Notice tone="danger" title="Tu cuenta está inactiva">
          {data.expired && <>Venció el {formatLongDate(data.expired)}.</>}
        </Notice>
      )}

      {/* Empresa nueva (p. ej. registro de prueba): sin firma no puede emitir */}
      {data.hasCert === false && (
        <Notice
          tone="warning"
          title="Sube tu firma electrónica para empezar a facturar"
          action={
            <Link
              href="/settings"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryhover transition-colors"
            >
              Subir firma (.p12)
            </Link>
          }
        >
          Tu establecimiento y punto de emisión 001 ya están listos. Solo falta el archivo de tu firma y su contraseña.
        </Notice>
      )}

      {(isCertExpired || isCertSoonToExpire) && (
        <Notice
          tone={isCertExpired ? 'danger' : 'warning'}
          title={isCertExpired ? 'Tu firma electrónica caducó' : 'Tu firma electrónica está por caducar'}
          action={
            <a
              href="https://www.facec.ec/firma-electronica"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryhover transition-colors"
            >
              Renovar firma
            </a>
          }
        >
          {isCertExpired
            ? 'Sin firma vigente no puedes emitir comprobantes. Renuévala para seguir facturando.'
            : `Caduca el ${formatLongDate(data.certExpiration!)}.`}
        </Notice>
      )}

      {/* Estado de los comprobantes en el SRI: lo primero que hay que atender */}
      {data.sri && <SriStrip sri={data.sri} />}

      {/* Mes en curso + cartera (en Facturador, la invitación al plan Financiero va primero) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {isFacturador && cartera}
        <div className="lg:col-span-2 grid">
          <MonthSummary income={data.income} expenses={data.expenses} />
        </div>
        {!isFacturador && cartera}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <BalanceChart income={data.income} expenses={data.expenses} />
        </div>
        <RecordsPanel counts={data.counts} newThisMonth={data.newThisMonth} />
      </div>

      <RecentOrdersTable orders={data.recentOrders} />

    </div>
  );
};

export default InvoicesPage;
