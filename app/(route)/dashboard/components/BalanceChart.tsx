"use client";

import { DashboardChartItem } from "@/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

interface BalanceChartProps {
    income: DashboardChartItem[];
    expenses: DashboardChartItem[];
}

const currency = (value: number) =>
    value.toLocaleString("es-EC", { style: "currency", currency: "USD" });

export const BalanceChart = ({ income, expenses }: BalanceChartProps) => {
    const periods = Array.from(
        new Set([...income.map((i) => i.period), ...expenses.map((e) => e.period)])
    ).sort();

    const data = periods.map((period) => ({
        name: income.find((i) => i.period === period)?.name ?? expenses.find((e) => e.period === period)?.name ?? period,
        income: income.find((i) => i.period === period)?.total ?? 0,
        expenses: expenses.find((e) => e.period === period)?.total ?? 0,
    }));

    const totalIncome = income.reduce((sum, i) => sum + i.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    const balance = totalIncome - totalExpenses;

    return (
        <div className="w-full p-4 bg-white dark:bg-slate-800 rounded shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Balance</h2>
                <span className={`text-lg font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {currency(balance)}
                </span>
            </div>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => currency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="income" name="Ingresos" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" name="Egresos" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
