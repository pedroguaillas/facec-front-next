import { CSSProperties } from "react";
import { FaGift } from "react-icons/fa6";

// Regalos cayendo detrás del contenido de la tarjeta: posición, tamaño, ritmo y vaivén repartidos (sin aleatorio)
const GIFTS = [
    { left: '6%', size: 'text-xl', fall: '5.2s', delay: '0s', sway: '12px', tone: 'text-brand-ink/30' },
    { left: '22%', size: 'text-base', fall: '6.4s', delay: '1.8s', sway: '-10px', tone: 'text-primary/30' },
    { left: '41%', size: 'text-2xl', fall: '5.8s', delay: '3.1s', sway: '16px', tone: 'text-brand-ink/25' },
    { left: '58%', size: 'text-lg', fall: '4.9s', delay: '0.9s', sway: '-14px', tone: 'text-sri-wait/40' },
    { left: '74%', size: 'text-xl', fall: '6.1s', delay: '2.5s', sway: '10px', tone: 'text-primary/30' },
    { left: '90%', size: 'text-base', fall: '5.5s', delay: '4s', sway: '-12px', tone: 'text-brand-ink/30' },
];

// Invitación: los regalos van cayendo mientras la persona decide si probar
export const GiftRain = () => (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {GIFTS.map((gift, i) => (
            <FaGift
                key={i}
                className={`absolute top-0 ${gift.size} ${gift.tone} animate-gift-rain`}
                style={{ left: gift.left, animationDelay: gift.delay, '--fall': gift.fall, '--sway': gift.sway, '--drop': '340px' } as CSSProperties}
            />
        ))}
    </div>
);
