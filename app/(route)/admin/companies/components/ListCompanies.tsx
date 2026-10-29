"use client";

import { IconButton, PlanBadge, TableResponsive } from "@/components"
import { useCompanies } from "../context/CompaniesContext"
import { formatPlanDate as formatDate, isSubscriptionExpired as isExpired } from "@/helpers/subscriptionHelper"
import { Company, Subscription } from "@/types"
import { activityLabels, activityStatusOf, activityStyles, relativeDays } from "./activity"

// Última suscripción de la empresa (vigente o vencida); null = nunca tuvo plan
const PlanCell = ({ subscription }: { subscription?: Subscription | null }) => {
  if (!subscription) return <span className="text-xs font-semibold text-red-600 dark:text-red-400">Sin plan</span>;
  return <PlanBadge plan={subscription.plan} />;
};

const EndsAtCell = ({ subscription }: { subscription?: Subscription | null }) => {
  if (!subscription?.ended_at) return <span className="opacity-40">-</span>;
  if (isExpired(subscription)) {
    return <span className="font-semibold text-red-600 dark:text-red-400">{formatDate(subscription.ended_at)} (vencido)</span>;
  }
  return <span>{formatDate(subscription.ended_at)}</span>;
};

// Uso de la cuenta: estado + última vez que algún usuario de la empresa usó el sistema
const ActivityCell = ({ company }: { company: Company }) => {
  const status = activityStatusOf(company);
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${activityStyles[status]}`}>{activityLabels[status]}</span>
      <span className="text-xs text-ink-3" title={company.last_activity_at ? new Date(company.last_activity_at).toLocaleString('es-EC') : undefined}>
        {relativeDays(company.last_activity_at)}
      </span>
    </div>
  );
};

// Comprobantes de los últimos 30 días: ventas y compras
const VouchersCell = ({ company }: { company: Company }) => (
  <div className="flex flex-col text-xs tabular-nums whitespace-nowrap">
    <span><span className="font-semibold text-ink-1">{company.orders_30d ?? 0}</span> <span className="text-ink-3">{company.orders_30d === 1 ? 'venta' : 'ventas'}</span></span>
    <span><span className="font-semibold text-ink-1">{company.shops_30d ?? 0}</span> <span className="text-ink-3">{company.shops_30d === 1 ? 'compra' : 'compras'}</span></span>
  </div>
);

export const ListCompanies = () => {

  const { companies } = useCompanies()

  return (
    <TableResponsive>
      <thead>
        <tr>
          <th>#</th>
          <th>RUC</th>
          <th className="text-left">Razon Social</th>
          <th className="text-left">Usuario</th>
          <th className="text-left">Plan</th>
          <th>Vence</th>
          <th className="text-left">Actividad</th>
          <th className="text-left">Últimos 30 días</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company, index) => (
          <tr key={company.id}
          >
            <td>{index + 1}</td>
            <td>{company.ruc}</td>
            <td className="text-left">{company.company}</td>
            <td className="text-left">
              {company.user ? (
                <div className="flex flex-col">
                  <span>{company.user.user}</span>
                  <span className="text-xs opacity-60">{company.user.email}</span>
                </div>
              ) : (
                <span className="opacity-40">-</span>
              )}
            </td>
            <td className="text-left"><PlanCell subscription={company.last_subscription} /></td>
            <td><EndsAtCell subscription={company.last_subscription} /></td>
            <td className="text-left"><ActivityCell company={company} /></td>
            <td className="text-left"><VouchersCell company={company} /></td>
            <td className="w-1">
              <div className="flex gap-2">
                <IconButton type="link" action="view" url={`/admin/companies/${company.id}/subscriptions`} title="Historial de suscripciones" />
                <IconButton type="link" action="edit" url={`/admin/companies/${company.id}`} title="Editar" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </TableResponsive>
  )
}
