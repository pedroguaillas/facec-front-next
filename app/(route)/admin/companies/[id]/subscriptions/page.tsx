"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Dialog, IconButton, PlanBadge, TableResponsive, Title } from "@/components";
import { deleteCompanySubscription, getCompanySubscriptions } from "../../services/companiesServices";
import { ChangePlanModal } from "../../shared/ChangePlanModal";
import { EditSubscriptionModal } from "../../shared/EditSubscriptionModal";
import { useToast } from "@/context/ToastContext";
import { formatAmount, formatPlanDate, isSubscriptionExpired, subscriptionAmount } from "@/helpers/subscriptionHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { CompanySubscriptions, Subscription } from "@/types";

const statusOf = (subscription: Subscription, currentId?: number) => {
    if (subscription.id === currentId && !isSubscriptionExpired(subscription)) {
        return { label: 'Vigente', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    }
    if (subscription.id === currentId) {
        return { label: 'Vencido', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' };
    }
    return { label: 'Finalizado', className: 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300' };
};

const PageCompanySubscriptions = () => {

    const params = useParams();
    const id = params.id as string;
    const axiosAuth = useAxiosAuth();
    const [subscriptions, setSubscriptions] = useState<CompanySubscriptions | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Subscription | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { toast } = useToast();

    const fetchSubscriptions = useCallback(async () => {
        const { data } = await getCompanySubscriptions(axiosAuth, id);
        if (data) setSubscriptions(data);
    }, [axiosAuth, id]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const confirmDelete = async (accept: boolean) => {
        const subscriptionId = deleteId;
        setDeleteId(null);
        if (!accept || subscriptionId === null) return;
        const { error } = await deleteCompanySubscription(axiosAuth, id, subscriptionId);
        if (error) {
            toast(error, 'error');
            return;
        }
        toast('Suscripción eliminada');
        fetchSubscriptions();
    };

    const history = subscriptions?.history ?? [];
    const current = subscriptions?.current ?? null;
    const totalPaid = history.reduce((total, subscription) => total + subscriptionAmount(subscription), 0);

    return (
        <div className="dark:text-gray-300">
            <Title
                title="Historial de suscripciones"
                subTitle={subscriptions ? `${subscriptions.company.company} · ${subscriptions.company.ruc}` : 'Contribuyente'}
                actions={[
                    { label: "Cambiar / renovar plan", type: "button", action: "edit", onClick: () => setIsModalOpen(true) },
                    { label: "Regresar", type: "link", url: "/admin/companies", action: "back" },
                ]}
            />
            <div className="md:mx-8 py-4">
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">

                    {/* Resumen */}
                    <div className="flex flex-wrap gap-x-10 gap-y-3 mb-4">
                        <Summary label="Plan vigente">
                            {current ? <PlanBadge plan={current.plan} size="sm" /> : <span className="text-red-600 dark:text-red-400">Sin plan</span>}
                        </Summary>
                        <Summary label="Vence">{current ? formatPlanDate(current.ended_at) : '-'}</Summary>
                        <Summary label="Suscripciones">{history.length}</Summary>
                        <Summary label="Total pagado">{formatAmount(totalPaid)}</Summary>
                    </div>

                    <TableResponsive>
                        <thead>
                            <tr>
                                <th className="text-left">PLAN</th>
                                <th>DESDE</th>
                                <th>HASTA</th>
                                <th className="text-right">MONTO</th>
                                <th>ESTADO</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions === null && (
                                <tr><td colSpan={6} className="py-6 opacity-60">Cargando…</td></tr>
                            )}
                            {subscriptions !== null && history.length === 0 && (
                                <tr><td colSpan={6} className="py-6 opacity-60">La empresa no tiene suscripciones registradas.</td></tr>
                            )}
                            {history.map((subscription) => {
                                const status = statusOf(subscription, current?.id);
                                return (
                                    <tr key={subscription.id}>
                                        <td className="text-left"><PlanBadge plan={subscription.plan} /></td>
                                        <td>{formatPlanDate(subscription.started_at)}</td>
                                        <td>{formatPlanDate(subscription.ended_at)}</td>
                                        <td className="text-right tabular-nums">{formatAmount(subscriptionAmount(subscription))}</td>
                                        <td>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>{status.label}</span>
                                        </td>
                                        <td className="w-1 whitespace-nowrap">
                                            <IconButton type="button" action="edit" onClick={() => setEditing(subscription)} title="Editar" />
                                            <IconButton type="button" action="delete" onClick={() => setDeleteId(subscription.id)} title="Eliminar" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </TableResponsive>
                </div>
            </div>

            {isModalOpen && (
                <ChangePlanModal
                    companyId={id}
                    currentPlan={current?.plan}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        setIsModalOpen(false);
                        fetchSubscriptions();
                    }}
                />
            )}

            {editing && (
                <EditSubscriptionModal
                    companyId={id}
                    subscription={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        fetchSubscriptions();
                    }}
                />
            )}

            <Dialog
                itemId={deleteId}
                confirmation={confirmDelete}
                title="¿Eliminar esta suscripción?"
                sutTitle="Se borrará el registro de forma permanente. Si es el plan vigente, la empresa quedará con el plan anterior que siga vigente o sin plan."
            />
        </div>
    )
}

const Summary = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <p className="text-xs uppercase tracking-wide opacity-60">{label}</p>
        <div className="mt-1 text-base font-semibold">{children}</div>
    </div>
);

export default PageCompanySubscriptions;
