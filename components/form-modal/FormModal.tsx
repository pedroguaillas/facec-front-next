"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { FaExclamationCircle, FaSave, FaSpinner } from "react-icons/fa";
import { Modal, ModalProps } from "../modal/Modal";

interface Props {
    title: string;
    subtitle?: string;
    onClose: () => void;
    onSubmit: () => void;
    isPending?: boolean;
    // Mientras carga (ej. datos para editar) se muestra un esqueleto y no se puede guardar
    isLoading?: boolean;
    // Si hay cambios sin guardar se pide confirmación antes de cerrar
    isDirty?: boolean;
    // Error general (no asociado a un campo)
    message?: string;
    submitLabel?: string;
    modalSize?: ModalProps['modalSize'];
    children: ReactNode;
}

// Primer campo editable (omite radios del selector de tipo y campos de solo lectura)
const FIRST_FIELD = 'input:not([type="radio"]):not([readonly]):not([disabled]), select:not([disabled]), textarea:not([readonly]):not([disabled])';

export const FormModal = ({
    title,
    subtitle,
    onClose,
    onSubmit,
    isPending = false,
    isLoading = false,
    isDirty = false,
    message,
    submitLabel = 'Guardar',
    modalSize = 'md',
    children,
}: Props) => {

    const formId = useId();
    const formRef = useRef<HTMLFormElement>(null);
    const [confirmingDiscard, setConfirmingDiscard] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            formRef.current?.querySelector<HTMLElement>(FIRST_FIELD)?.focus();
        }
    }, [isLoading]);

    const requestClose = () => {
        if (isPending) return;
        if (isDirty && !confirmingDiscard) {
            setConfirmingDiscard(true);
            return;
        }
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Evita que el submit llegue a un formulario padre (el modal puede estar dentro de otro form)
        e.stopPropagation();
        if (isLoading || isPending) return;
        setConfirmingDiscard(false);
        onSubmit();
    };

    const footer = confirmingDiscard ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" role="alert">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tienes cambios sin guardar. ¿Descartarlos?
            </p>
            <div className="flex gap-2 justify-end">
                <button type="button" className={secondaryButton} onClick={() => setConfirmingDiscard(false)} autoFocus>
                    Seguir editando
                </button>
                <button type="button" className={`${baseButton} bg-danger hover:bg-dangerhover text-white`} onClick={onClose}>
                    Descartar
                </button>
            </div>
        </div>
    ) : (
        <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-red-500">*</span> Obligatorio
            </p>
            <div className="flex gap-2">
                <button type="button" className={secondaryButton} onClick={requestClose} disabled={isPending}>
                    Cancelar
                </button>
                <button
                    type="submit"
                    form={formId}
                    className={`${baseButton} min-w-28 bg-primary hover:bg-primaryhover text-white`}
                    disabled={isPending || isLoading}
                >
                    {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {isPending ? 'Guardando…' : submitLabel}
                </button>
            </div>
        </div>
    );

    return (
        <Modal isOpen title={title} subtitle={subtitle} onClose={requestClose} modalSize={modalSize} footer={footer}>
            {message && (
                <div className="flex items-start gap-2 mb-3 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900" role="alert">
                    <FaExclamationCircle className="shrink-0 mt-0.5" />
                    <span>{message}</span>
                </div>
            )}

            {isLoading ? (
                <FormSkeleton />
            ) : (
                <form id={formId} ref={formRef} noValidate onSubmit={handleSubmit}>
                    <fieldset disabled={isPending} className="contents">
                        {children}
                    </fieldset>
                </form>
            )}
        </Modal>
    )
}

const baseButton = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
const secondaryButton = `${baseButton} border border-[var(--border-strong)] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700`;

const FormSkeleton = () => (
    <div className="animate-pulse space-y-5 py-2" aria-label="Cargando datos" role="status">
        {[0, 1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-slate-700" />
                <div className="h-9 w-full rounded-lg bg-gray-200 dark:bg-slate-700" />
            </div>
        ))}
    </div>
);

// Subtítulo para agrupar campos dentro de un FormModal
export const FormSectionTitle = ({ children }: { children: ReactNode }) => (
    <p className="mt-5 mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{children}</p>
);
