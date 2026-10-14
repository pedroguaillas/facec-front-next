import { recurringStatusLabels } from "@/constants";
import { RecurringStatus } from "@/types";

const tones: Record<RecurringStatus, string> = {
    ACTIVA: 'bg-sri-ok-soft text-sri-ok',
    PAUSADA: 'bg-sri-wait-soft text-sri-wait',
    FINALIZADA: 'bg-surface-sunken text-ink-3',
};

export const RecurringStatusBadge = ({ status }: { status: RecurringStatus }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[status]}`}>
        {recurringStatusLabels[status]}
    </span>
);

// Último intento fallido: se reintenta sola cada hora
export const RecurringErrorBadge = ({ message }: { message: string }) => (
    <span title={message} className="inline-flex items-center rounded-full bg-sri-fail-soft px-2 py-0.5 text-xs font-medium text-sri-fail">
        Falló la última
    </span>
);
