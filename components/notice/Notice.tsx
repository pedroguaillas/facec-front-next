import { ReactNode } from "react";
import { FaCircleInfo, FaClock, FaTriangleExclamation } from "react-icons/fa6";

type Tone = 'danger' | 'warning' | 'info';

const tones: Record<Tone, { box: string; icon: string; Icon: React.ElementType }> = {
    danger: { box: 'bg-sri-fail-soft border-sri-fail/30', icon: 'text-sri-fail', Icon: FaTriangleExclamation },
    warning: { box: 'bg-sri-wait-soft border-sri-wait/30', icon: 'text-sri-wait', Icon: FaClock },
    info: { box: 'bg-brand-soft border-brand-ink/20', icon: 'text-brand-ink', Icon: FaCircleInfo },
};

interface Props {
    tone: Tone;
    title: string;
    children?: ReactNode;
    // Acción a la derecha (link o botón)
    action?: ReactNode;
}

// Aviso dentro de la página (firma, cuenta, plan): mismo lenguaje que los estados del SRI
export const Notice = ({ tone, title, children, action }: Props) => {
    const { box, icon, Icon } = tones[tone];

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border px-4 py-3 ${box}`} role={tone === 'danger' ? 'alert' : 'status'}>
            <Icon className={`shrink-0 text-base ${icon}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-1">{title}</p>
                {children && <div className="text-sm text-ink-2 mt-0.5">{children}</div>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
};
