import { ReactNode } from "react";
import { InstallPrompt } from "../install-prompt/InstallPrompt";

interface Props {
    children: ReactNode;
    // Ancho en computadora (con panel lateral)
    wide?: 'md' | 'lg';
}

// Contenedor de las páginas públicas (login, registro): tarjeta angosta en celular;
// en computadora panel de marca + formulario (los arma cada página)
export const AuthShell = ({ children, wide = 'lg' }: Props) => (
    <div className="min-h-dvh w-full flex justify-center items-center px-4 py-8 bg-gradient-to-br from-primarywhite via-primarywhite/50 to-primaryhover dark:from-primary dark:via-primary/80 dark:to-primaryhover/50">
        <div className={`w-full max-w-md ${wide === 'lg' ? 'lg:max-w-5xl' : 'lg:max-w-4xl'} rounded-2xl overflow-hidden shadow-xl shadow-primary/10 border border-[var(--border)] bg-white dark:bg-gray-900 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
            {children}
        </div>
        <InstallPrompt />
    </div>
);
