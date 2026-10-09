// Estado del comprobante electrónico en el SRI: verde autorizado, ámbar en camino, rojo rechazado
type Stage = 'ok' | 'wait' | 'fail' | 'void';

const stageOf = (state: string): Stage => {
    const value = state.toUpperCase().replace(/_/g, ' ');
    if (value === 'AUTORIZADO') return 'ok';
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
}

export const SriStatus = ({ state }: Props) => {
    const label = (state || 'CREADO').replace(/_/g, ' ');
    const stage = stageOf(label);

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${styles[stage]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[stage]}`} aria-hidden="true" />
            {label}
        </span>
    );
};
