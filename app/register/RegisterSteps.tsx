import { TRIAL_LABEL } from "@/constants/register";
import { FaCheck } from "react-icons/fa";

// Lo que pasa después de registrarse (igual a lo que prepara el backend)
const steps = [
    { title: 'Registra tu RUC', detail: 'Traemos tu razón social del SRI.' },
    { title: 'Confirma tu correo', detail: 'El enlace es válido por 24 horas.' },
    { title: 'Sube tu firma electrónica', detail: 'Archivo .p12 y su contraseña.' },
    { title: 'Emite desde 001-001', detail: 'Establecimiento y punto de emisión ya creados.' },
];

interface Props {
    // Paso actual (0 = registro, 1 = confirmar correo)
    current: number;
}

// Panel de marca, solo en computadora: qué incluye la prueba y en qué paso está
export const RegisterSteps = ({ current }: Props) => (
    <aside className="hidden lg:flex flex-col justify-between gap-10 p-10 bg-primary text-white">
        <div>
            <p className="font-semibold text-3xl tracking-tight">facec</p>
            <p className="mt-8 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {TRIAL_LABEL}
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight">
                Tu facturación electrónica lista en minutos
            </h2>

            <ol className="mt-8">
                {steps.map((step, index) => {
                    const done = index < current;
                    const active = index === current;
                    return (
                        <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                            {/* Línea que une los pasos */}
                            {index < steps.length - 1 && (
                                <span className="absolute left-[13px] top-7 bottom-0 w-px bg-white/25" aria-hidden="true" />
                            )}
                            <span
                                className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums
                                    ${done ? 'bg-white text-primary' : active ? 'bg-white text-primary ring-4 ring-white/25' : 'border border-white/40 text-white/70'}`}
                                aria-current={active ? 'step' : undefined}
                            >
                                {done ? <FaCheck aria-hidden="true" /> : index + 1}
                            </span>
                            <div className={active || done ? '' : 'opacity-70'}>
                                <p className="text-sm font-semibold">{step.title}</p>
                                <p className="text-sm text-white/75">{step.detail}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>

        <p className="text-xs text-white/70">
            Al terminar la prueba eliges el plan Facturador o Financiero.
        </p>
    </aside>
);
