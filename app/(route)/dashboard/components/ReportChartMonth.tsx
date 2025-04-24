import { ItemEgressChart, ItemIngressChart } from '@/types';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ReportChartMonthProps {
  color: string;
  title: string;
  items: ItemIngressChart[] | ItemEgressChart[];
}

export const ReportChartMonth = ({ color, title, items }: ReportChartMonthProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white dark:bg-slate-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center text-slate-700 dark:text-slate-200">
        {title}
      </h2>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey={title === 'Ventas' ? 'ingreso' : 'egreso'}
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
