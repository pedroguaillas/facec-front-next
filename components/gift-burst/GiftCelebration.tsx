"use client";

import { CSSProperties, ReactNode } from "react";
import { FaGift } from "react-icons/fa6";

const COLORS = ['bg-brand-ink', 'bg-sri-ok', 'bg-sri-wait', 'bg-primary', 'bg-sri-fail'];

// Lluvia fija (sin aleatorio en cada render): posición, retraso, duración y vaivén repartidos
const RAIN = Array.from({ length: 48 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: `${(i % 12) * 120}ms`,
    fall: `${2200 + (i % 5) * 300}ms`,
    sway: `${(i % 2 ? 1 : -1) * (15 + (i % 4) * 12)}px`,
    r: `${(i % 2 ? 1 : -1) * (240 + (i % 6) * 60)}deg`,
    color: COLORS[i % COLORS.length],
    shape: i % 3 === 0 ? 'w-2 h-4 rounded-sm' : i % 3 === 1 ? 'w-2.5 h-2.5 rounded-full' : 'w-3 h-1.5 rounded-sm',
}));

// Estallido al tocar el suelo
const BURST = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const distance = 70 + (i % 3) * 22;
    return {
        x: `${Math.round(Math.cos(angle) * distance)}px`,
        y: `${Math.round(Math.sin(angle) * distance)}px`,
        r: `${(i % 2 ? 1 : -1) * (160 + i * 20)}deg`,
        color: COLORS[i % COLORS.length],
    };
});

interface Props {
    title: string;
    children?: ReactNode;
}

// Pantalla de regalo: llueve confeti, el regalo cae del cielo, rebota al tocar el suelo y estalla
export const GiftCelebration = ({ title, children }: Props) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-[color-mix(in_oklab,var(--background)_88%,transparent)] backdrop-blur-sm animate-fade-in" role="status" aria-live="polite">
        {/* Lluvia de confeti desde arriba */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {RAIN.map((piece, i) => (
                <span
                    key={i}
                    className={`absolute top-0 ${piece.shape} ${piece.color} animate-confetti-fall`}
                    style={{ left: piece.left, animationDelay: piece.delay, '--fall': piece.fall, '--sway': piece.sway, '--r': piece.r } as CSSProperties}
                />
            ))}
        </div>

        <div className="relative flex flex-col items-center px-6 text-center">
            <div className="relative w-32 h-32" aria-hidden="true">
                {/* Onda y estallido cuando aterriza (≈ 70% de la caída) */}
                <span className="absolute inset-0 rounded-full bg-brand-ink/30 animate-gift-ring" style={{ animationDelay: '880ms' }} />
                {BURST.map((piece, i) => (
                    <span
                        key={i}
                        className={`absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-sm ${piece.color} animate-confetti`}
                        style={{ '--x': piece.x, '--y': piece.y, '--r': piece.r, animationDelay: '900ms' } as CSSProperties}
                    />
                ))}
                <span className="absolute inset-3 flex items-center justify-center rounded-3xl bg-primary text-white shadow-xl origin-bottom animate-gift-drop">
                    <FaGift className="text-5xl" />
                </span>
            </div>
            {/* Sombra en el suelo */}
            <span className="mt-1 h-2 w-20 rounded-full bg-ink-1/15 blur-sm animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'both' }} aria-hidden="true" />

            <p className="mt-6 text-2xl font-semibold tracking-tight text-ink-1 animate-rise-in" style={{ animationDelay: '1100ms' }}>{title}</p>
            <div className="mt-2 text-sm text-ink-2 animate-rise-in" style={{ animationDelay: '1300ms' }}>{children}</div>
        </div>
    </div>
);
