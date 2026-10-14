import Link from "next/link";

interface Props {
    // "FAC 001-005-000056867" (el prefijo es opcional)
    serie?: string | null;
    href: string;
}

// Número de comprobante en una sola línea: tipo y establecimiento-punto atenuados, el secuencial resalta
export const VoucherSerie = ({ serie, href }: Props) => {
    const value = serie?.trim() ?? '';
    const [prefix, number] = value.includes(' ') ? [value.split(' ')[0], value.split(' ').slice(1).join(' ')] : ['', value];
    const match = number.match(/^(\d{3}-\d{3}-)(\d+)$/);

    return (
        <Link
            href={href}
            className="group inline-flex items-baseline gap-1.5 whitespace-nowrap font-mono text-[13px] tabular-nums hover:underline underline-offset-2 decoration-brand-ink/40"
        >
            {prefix && <span className="font-sans text-[11px] font-semibold tracking-wide text-ink-3">{prefix}</span>}
            {match ? (
                <span>
                    <span className="text-ink-3">{match[1]}</span>
                    <span className="text-brand-ink">{match[2]}</span>
                </span>
            ) : (
                <span className="text-brand-ink">{number || '—'}</span>
            )}
        </Link>
    );
};
