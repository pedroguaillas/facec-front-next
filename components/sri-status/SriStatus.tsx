import { FaCircleInfo } from "react-icons/fa6";

// Estado del comprobante electrónico en el SRI: verde autorizado, ámbar en camino, rojo rechazado
type Stage = 'ok' | 'wait' | 'fail' | 'void';

// Estados en camino al SRI: el punto late mientras se consulta
const PENDING = ['FIRMADO', 'ENVIADO', 'RECIBIDA', 'EN PROCESO', 'PENDIENTE DE ANULAR'];

const stageOf = (state: string, isElectronic: boolean): Stage => {
    const value = state.toUpperCase().replace(/_/g, ' ');
    if (value === 'AUTORIZADO') return 'ok';
    // Nota de venta y proforma no van al SRI: creado ya es el estado final
    if (value === 'CREADO' && !isElectronic) return 'ok';
    if (value === 'ANULADO') return 'void';
    if (value === 'DEVUELTA' || value === 'NO AUTORIZADO') return 'fail';
    return 'wait';
};

const styles: Record<Stage, string> = {
    ok: 'bg-sri-ok-soft text-sri-ok',
    wait: 'bg-sri-wait-soft text-sri-wait',
    fail: 'bg-sri-fail-soft text-sri-fail',
    void: 'bg-surface-sunken text-ink-3 line-through decoration-ink-4',
};

const dots: Record<Stage, string> = {
    ok: 'bg-sri-ok',
    wait: 'bg-sri-wait',
    fail: 'bg-sri-fail',
    void: 'bg-ink-4',
};

interface Props {
    state?: string | null;
    isElectronic?: boolean;
    // Motivo del SRI (devuelta / no autorizado): se ve al pasar el mouse
    detail?: string | null;
}

export const SriStatus = ({ state, isElectronic = true, detail }: Props) => {
    const label = (state || 'CREADO').replace(/_/g, ' ');
    const stage = stageOf(label, isElectronic);
    const pending = isElectronic && PENDING.includes(label.toUpperCase());

    return (
        <span
            title={detail ?? undefined}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${styles[stage]} ${detail ? 'cursor-help' : ''}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dots[stage]} ${pending ? 'animate-pulse' : ''}`} aria-hidden="true" />
            {label}
            {detail && <FaCircleInfo className="text-[10px] opacity-70" aria-label={detail} />}
        </span>
    );
};
