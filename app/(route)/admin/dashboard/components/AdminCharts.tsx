"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminDashboard } from "@/types";

// Estados del SRI (mismos tonos que --sri-ok / --sri-fail); la marca para el crecimiento
const AUTHORIZED_COLOR = '#0f7a55';
const REJECTED_COLOR = '#c0261b';
const BRAND_COLOR = '#0e7c86';

const tooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--line-strong)',
    borderRadius: 8,
    fontSize: 12,
    color: 'var(--ink-1)',
};
const axisTick = { fontSize: 12, fill: '#94a3b8' };

// "2026-10-05" → "5 oct"
const dayLabel = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' });

// "2026-10" → "oct 26"
const monthLabel = (month: string) =>
    new Date(`${month}-15T12:00:00Z`).toLocaleDateString('es-EC', { month: 'short', year: '2-digit', timeZone: 'UTC' });

const Legend = ({ items }: { items: { label: string; color: string }[] }) => (
    <div className="flex items-center gap-4 text-xs text-ink-2">
        {items.map(item => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} /> {item.label}
            </span>
        ))}
    </div>
);

// Comprobantes electrónicos por día (30 días): autorizados y rechazados apilados
export const VouchersByDayChart = ({ data }: { data: AdminDashboard['vouchers']['by_day'] }) => (
    <section className="rounded-xl border border-line bg-surface p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Comprobantes electrónicos · 30 días</p>
            <Legend items={[{ label: 'Autorizados', color: AUTHORIZED_COLOR }, { label: 'Rechazados', color: REJECTED_COLOR }]} />
        </div>
        {data.length === 0 ? (
            <p className="h-[240px] flex items-center justify-center text-sm text-ink-3">Sin comprobantes en los últimos 30 días.</p>
        ) : (
            <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.map(d => ({ ...d, name: dayLabel(d.date) }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
                        <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} minTickGap={16} />
                        <YAxis tickLine={false} axisLine={false} width={44} tick={axisTick} allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                            formatter={(value: number, name: string) => [value.toLocaleString('es-EC'), name === 'authorized' ? 'Autorizados' : 'Rechazados']}
                            contentStyle={tooltipStyle}
                        />
                        <Bar dataKey="authorized" stackId="v" fill={AUTHORIZED_COLOR} stroke="var(--surface)" strokeWidth={1} />
                        <Bar dataKey="rejected" stackId="v" fill={REJECTED_COLOR} stroke="var(--surface)" strokeWidth={1} radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}
    </section>
);

// Contribuyentes nuevos por mes (6 meses)
export const NewCompaniesChart = ({ data }: { data: AdminDashboard['companies']['by_month'] }) => (
    <section className="rounded-xl border border-line bg-surface p-5 lg:p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-3">Contribuyentes nuevos por mes</p>
        {data.length === 0 ? (
            <p className="h-[200px] flex items-center justify-center text-sm text-ink-3">Sin registros.</p>
        ) : (
            <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.map(d => ({ ...d, name: monthLabel(d.month) }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="32%">
                        <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} />
                        <YAxis tickLine={false} axisLine={false} width={36} tick={axisTick} allowDecimals={false} />
                        <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} formatter={(value: number) => [value, 'Nuevos']} contentStyle={tooltipStyle} />
                        <Bar dataKey="count" fill={BRAND_COLOR} radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}
    </section>
);
