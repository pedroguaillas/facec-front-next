import { FaCheck } from "react-icons/fa6";

// Ciclo de un comprobante en el SRI (ilustración, no son datos reales)
const lifecycle = ['Firmado', 'Enviado', 'Autorizado'];

// Panel de marca, solo en computadora
export const LoginAside = () => (
    <aside className="hidden lg:flex flex-col justify-between gap-10 p-10 bg-primary text-white">
        <div>
            <p className="font-semibold text-3xl tracking-tight">facec</p>
            <h2 className="mt-10 text-2xl font-semibold leading-snug tracking-tight">
                Factura, cobra y revisa el SRI en un solo lugar
            </h2>
        </div>

        {/* Comprobante de ejemplo recorriendo los estados del SRI */}
        <div className="rounded-xl bg-white/10 border border-white/15 p-5" aria-hidden="true">
            <div className="flex items-baseline justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">Factura</p>
                    <p className="mt-0.5 font-mono text-sm tabular-nums">001-001-000000128</p>
                </div>
                <p className="text-xl font-semibold tabular-nums">$112.50</p>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-white/25 flex flex-wrap items-center gap-1.5">
                {lifecycle.map((state, index) => {
                    const last = index === lifecycle.length - 1;
                    return (
                        <span key={state} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
                            ${last ? 'bg-white text-primary' : 'bg-white/15 text-white/85'}`}>
                            <FaCheck className="text-[10px]" />
                            {state}
                        </span>
                    );
                })}
            </div>
        </div>

        <p className="text-xs text-white/70">Facturación electrónica para el SRI del Ecuador.</p>
    </aside>
);
