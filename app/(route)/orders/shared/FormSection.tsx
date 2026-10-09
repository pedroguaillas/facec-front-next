import { ReactNode } from "react";

interface Props {
    title: string;
    // Acción o dato a la derecha del título (ej. Importar, fecha)
    aside?: ReactNode;
    children: ReactNode;
}

// Bloque del formulario de venta: mismo encabezado en todas las secciones, separadas solo por una línea
export const FormSection = ({ title, aside, children }: Props) => (
    <section className="py-5 first:pt-0 last:pb-0 border-b border-line last:border-b-0">
        <div className="flex items-center justify-between gap-3 mb-3 min-h-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{title}</h2>
            {aside}
        </div>
        {children}
    </section>
);

// Fila punteada para agregar una línea al final de una lista (productos, reembolsos, info adicional)
// En celular ocupa todo el ancho; desde tablet se reduce y se alinea a la derecha
export const AddRowButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <div className="mt-2 flex md:justify-end">
        <button
            type="button"
            onClick={onClick}
            className="w-full md:w-auto md:px-5 rounded-lg border border-dashed border-line-strong py-2 text-sm font-medium text-ink-3 transition-colors cursor-pointer hover:text-brand-ink hover:border-brand-ink hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand-ink"
        >
            + {label}
        </button>
    </div>
);

// Estilos compartidos de las celdas editables de las tablas del formulario
export const cellInput = "w-full min-w-10 border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] text-ink-1 tabular-nums focus:outline-none focus:border-primary transition-colors";
export const cellInputError = "border-red-400";
export const cellInputNormal = "border-line-strong";
// Encabezado de tabla: etiqueta pequeña, sin grilla
export const tableHead = "[&>th]:px-1.5 [&>th]:pb-2 [&>th]:text-xs [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-wide [&>th]:text-ink-3 [&>th]:whitespace-nowrap border-b border-line";
export const tableRow = "border-b border-line [&>td]:px-1.5 [&>td]:py-2 align-top";
