"use client";

import { DashboardChartItem } from "@/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BalanceChartProps {
    income: DashboardChartItem[];
    expenses: DashboardChartItem[];
}

// Teal de la marca para lo que entra, pizarra para lo que sale
const INCOME_COLOR = '#0e7c86';
const EXPENSES_COLOR = '#94a3b8';

const currency = (value: number) =>
    value.toLocaleString("es-EC", { style: "currency", currency: "USD" });

const compact = (value: number) =>
    value >= 1000 ? `$${(value / 1000).toLocaleString('es-EC', { maximumFractionDigits: 1 })}k` : `$${value}`;

// period YYYYMM → "oct 26"
const label = (period: string) =>
    new Date(Date.UTC(Number(period.slice(0, 4)), Number(period.slice(4)) - 1, 15))
        .toLocaleDateString('es-EC', { month: 'short', year: '2-digit', timeZone: 'UTC' });

export const BalanceChart = ({ income, expenses }: BalanceChartProps) => {
    const periods = Array.from(
        new Set([...income.map((i) => i.period), ...expenses.map((e) => e.period)])
    ).sort().slice(-12);

    const data = periods.map((period) => ({
        name: label(period),
        income: income.find((i) => i.period === period)?.total ?? 0,
        expenses: expenses.find((e) => e.period === period)?.total ?? 0,
    }));

    return (
        <section className="rounded-xl border border-line bg-surface p-5 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Ingresos y egresos</p>
                <div className="flex items-center gap-4 text-xs text-ink-2">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: INCOME_COLOR }} /> Ingresos
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: EXPENSES_COLOR }} /> Egresos
                    </span>
                </div>
            </div>

            {data.length === 0 ? (
                <p className="h-[260px] flex items-center justify-center text-sm text-ink-3">Aún no hay movimientos para graficar.</p>
            ) : (
                <div className="w-full h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={2} barCategoryGap="28%">
                            <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis tickFormatter={compact} tickLine={false} axisLine={false} width={52} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                                formatter={(value: number, name: string) => [currency(value), name === 'income' ? 'Ingresos' : 'Egresos']}
                                contentStyle={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line-strong)',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    color: 'var(--ink-1)',
                                }}
                            />
                            <Bar dataKey="income" fill={INCOME_COLOR} radius={[3, 3, 0, 0]} />
                            <Bar dataKey="expenses" fill={EXPENSES_COLOR} radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
};
