"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Title } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { formatDate } from "@/helpers/dateHelper";
import { AdminDashboard, CompanyActivityStatus, PlanCode } from "@/types";
import { getAdminDashboard } from "./services/adminDashboardServices";
import { NewCompaniesChart, VouchersByDayChart } from "./components/AdminCharts";
import { activityLabels, activityStyles } from "../companies/components/activity";
import { planLabels } from "@/constants/plans";

const number = (value: number) => value.toLocaleString('es-EC');
const currency = (value: number) => value.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });

const Tile = ({ label, value, hint, tone }: { label: string; value: string; hint?: ReactNode; tone?: 'ok' | 'wait' | 'fail' }) => (
    <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-xs font-medium text-ink-3">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone === 'fail' ? 'text-sri-fail' : tone === 'wait' ? 'text-sri-wait' : 'text-ink-1'}`}>{value}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-3">{hint}</p>}
    </div>
);

const Panel = ({ title, children, empty, action }: { title: string; children: ReactNode; empty?: string | false; action?: ReactNode }) => (
    <section className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{title}</h2>
            {action}
        </div>
        {empty ? <p className="py-4 text-sm text-ink-3">{empty}</p> : children}
    </section>
);

// Fila de una empresa con su dato a la derecha
const CompanyRow = ({ id, company, ruc, right }: { id: number; company: string; ruc: string; right: ReactNode }) => (
    <li className="flex items-center justify-between gap-3 py-2">
        <Link href={`/admin/companies/${id}`} className="min-w-0 hover:underline">
            <span className="block truncate text-sm text-ink-1">{company}</span>
            <span className="block text-xs text-ink-3 tabular-nums">{ruc}</span>
        </Link>
        <span className="shrink-0 text-right text-xs tabular-nums">{right}</span>
    </li>
);

// El backend manda el código (FACTURADOR); se muestra su nombre
const planName = (plan: string) => planLabels[plan as PlanCode] ?? plan;

const daysLeftLabel = (days: number) => days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`;

const PageAdminDashboard = () => {
    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const [data, setData] = useState<AdminDashboard | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status !== 'authenticated') return;
        getAdminDashboard(axiosAuth).then(({ data, error }) => {
            if (data) setData(data);
            else setError(error ?? 'No se pudo cargar el resumen');
        });
    }, [axiosAuth, status]);

    return (
        <div className="dark:text-gray-300">
            <Title
                title="Inicio"
                subTitle={data ? `Resumen de todo el sistema · actualizado ${new Date(data.generated_at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}` : 'Resumen de todo el sistema'}
            />
            <div className="md:mx-8 py-4 flex flex-col gap-4">
                {error && <p className="text-sm text-red-500">{error}</p>}
                {!data && !error && <p className="py-8 text-center text-sm text-ink-3">Cargando resumen…</p>}
                {data && <DashboardContent data={data} />}
            </div>
        </div>
    );
};

const DashboardContent = ({ data }: { data: AdminDashboard }) => {
    const { vouchers, companies, subscriptions, signatures } = data;
    const newDiff = companies.new_month - companies.new_prev_month;

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <Tile label="Autorizados (mes)" value={number(vouchers.month.authorized)} tone="ok" />
                <Tile label="Sin autorizar (mes)" value={number(vouchers.month.pending)} tone={vouchers.month.pending ? 'wait' : undefined}
                    hint={vouchers.stuck > 0 ? `${number(vouchers.stuck)} atascados +24 h (30 días)` : 'Ninguno atascado'} />
                <Tile label="Rechazados (mes)" value={number(vouchers.month.rejected)} tone={vouchers.month.rejected ? 'fail' : undefined} />
                <Tile label="Contribuyentes nuevos" value={number(companies.new_month)}
                    hint={`${newDiff >= 0 ? '+' : ''}${newDiff} vs. mes anterior · ${number(companies.total)} en total`} />
                <Tile label="Por renovar (30 días)" value={number(subscriptions.renewals.length)}
                    hint={`${number(subscriptions.expired_recent)} vencidos sin renovar`} tone={subscriptions.expired_recent ? 'wait' : undefined} />
                <Tile label="Firmas vencidas" value={number(signatures.expired)}
                    hint={`${signatures.expiring.length} vencen en 30 días`} tone={signatures.expired ? 'fail' : undefined} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
                <VouchersByDayChart data={vouchers.by_day} />
                <Panel title="Uso de las cuentas" action={<Link href="/admin/companies" className="text-xs text-primary hover:underline">Ver lista</Link>}>
                    <ul className="divide-y divide-line">
                        {(Object.keys(activityLabels) as CompanyActivityStatus[]).map(key => (
                            <li key={key}>
                                <Link href={`/admin/companies?activity=${key}`} className="flex items-center justify-between py-2.5 hover:bg-surface-hover -mx-2 px-2 rounded">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${activityStyles[key]}`}>{activityLabels[key]}</span>
                                    <span className="text-sm font-semibold tabular-nums text-ink-1">{number(companies.activity[key])}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 items-start">
                <Panel title="Próximos a renovar" empty={subscriptions.renewals.length === 0 && 'Ninguna suscripción vence en los próximos 30 días.'}>
                    <ul className="divide-y divide-line max-h-80 overflow-y-auto">
                        {subscriptions.renewals.map(item => (
                            <CompanyRow key={item.id} {...item} right={<>
                                <span className={`block font-medium ${item.days_left <= 7 ? 'text-sri-wait' : 'text-ink-1'}`}>{daysLeftLabel(item.days_left)}</span>
                                <span className="block text-ink-3">{planName(item.plan)} · {formatDate(item.ended_at)}</span>
                            </>} />
                        ))}
                    </ul>
                </Panel>

                <Panel title="Comprobantes atascados" empty={vouchers.stuck_companies.length === 0 && 'No hay comprobantes de los últimos 30 días sin autorizar por más de 24 h.'}>
                    <ul className="divide-y divide-line max-h-80 overflow-y-auto">
                        {vouchers.stuck_companies.map(item => (
                            <CompanyRow key={item.id} {...item} right={<>
                                <span className="block font-medium text-sri-wait">{number(item.pending)} sin autorizar</span>
                                <span className="block text-ink-3">desde {formatDate(item.oldest_at.slice(0, 10))}</span>
                            </>} />
                        ))}
                    </ul>
                </Panel>

                <Panel title="Firmas electrónicas por vencer" empty={signatures.expiring.length === 0 && 'Ninguna firma vence en los próximos 30 días.'}>
                    <ul className="divide-y divide-line max-h-80 overflow-y-auto">
                        {signatures.expiring.map(item => (
                            <CompanyRow key={item.id} {...item} right={<>
                                <span className={`block font-medium ${item.days_left <= 7 ? 'text-sri-fail' : 'text-sri-wait'}`}>{daysLeftLabel(item.days_left)}</span>
                                <span className="block text-ink-3">{formatDate(item.sign_valid_to.slice(0, 10))}</span>
                            </>} />
                        ))}
                    </ul>
                </Panel>

                <Panel title="Rechazos más frecuentes del mes" empty={vouchers.top_errors.length === 0 && 'Sin rechazos este mes.'}>
                    <ul className="divide-y divide-line">
                        {vouchers.top_errors.map(item => (
                            <li key={item.message} className="flex items-start justify-between gap-3 py-2">
                                <span className="min-w-0 text-sm text-ink-2 break-words">{item.message}</span>
                                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-1">{number(item.count)}</span>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 items-start">
                <NewCompaniesChart data={companies.by_month} />
                <Panel title="Suscripciones activas por plan" empty={subscriptions.by_plan.length === 0 && 'Sin suscripciones activas.'}>
                    <ul className="divide-y divide-line">
                        {subscriptions.by_plan.map(item => (
                            <li key={item.plan} className="flex items-center justify-between py-2 text-sm">
                                <span className="text-ink-2">{planName(item.plan)}</span>
                                <span className="font-semibold tabular-nums text-ink-1">{number(item.count)}</span>
                            </li>
                        ))}
                    </ul>
                    {subscriptions.revenue_month !== null && (
                        <p className="mt-3 pt-3 border-t border-line flex items-baseline justify-between text-sm">
                            <span className="text-ink-2">Ingresos por planes este mes</span>
                            <span className="font-semibold tabular-nums text-ink-1">{currency(subscriptions.revenue_month)}</span>
                        </p>
                    )}
                </Panel>
            </div>
        </>
    );
};

export default PageAdminDashboard;
