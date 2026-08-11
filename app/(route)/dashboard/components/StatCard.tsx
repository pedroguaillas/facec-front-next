import { ReactNode } from "react";

interface StatCardProps {
    icon: ReactNode;
    value: number;
    label: string;
    accent: string;
    accentSoft: string;
    newThisMonth?: number;
}

export const StatCard = ({ icon, value, label, accent, accentSoft, newThisMonth }: StatCardProps) => (
    <article
        className="rounded-xl border p-5 flex flex-col gap-4"
        style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            borderLeft: `3px solid ${accent}`,
        }}
    >
        <div className="flex items-center justify-between">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: accentSoft, color: accent }}
            >
                {icon}
            </div>
            {!!newThisMonth && (
                <span
                    className="text-xs font-semibold rounded-full px-2 py-1"
                    style={{ background: accentSoft, color: accent }}
                >
                    +{newThisMonth} este mes
                </span>
            )}
        </div>
        <div>
            <h2 className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--foreground)' }}>
                {value}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                {label}
            </p>
        </div>
    </article>
);
