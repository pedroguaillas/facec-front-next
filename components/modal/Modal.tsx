"use client";

import React, { ReactNode, useEffect, useId, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  // Se muestra fijo debajo del contenido (no se desplaza con el scroll)
  footer?: ReactNode;
  modalSize?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Pila de modales abiertos: solo el de arriba responde a Esc / Tab
const openModals: string[] = [];
let scrollLocks = 0;

export const Modal = (props: ModalProps) => {
  if (!props.isOpen) return null;
  return <ModalPanel {...props} />;
};

const ModalPanel = ({
  onClose,
  title,
  subtitle,
  children,
  footer,
  modalSize = 'md',
  showCloseButton = true,
}: ModalProps) => {

  const modalId = useId();
  const titleId = `${modalId}-title`;
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const mouseDownOnBackdrop = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    openModals.push(modalId);
    scrollLocks++;
    document.body.style.overflow = 'hidden';

    // Los hijos pueden haber enfocado un campo; si no, se enfoca el panel
    if (panel && !panel.contains(document.activeElement)) {
      panel.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (openModals[openModals.length - 1] !== modalId || !panel) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
          .filter(el => el.offsetParent !== null);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = openModals.indexOf(modalId);
      if (index !== -1) openModals.splice(index, 1);
      scrollLocks--;
      if (scrollLocks === 0) document.body.style.overflow = '';
      if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
    };
  }, [modalId]);

  // Solo cierra si el clic empezó y terminó en el fondo (evita cerrar al seleccionar texto y soltar fuera)
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownOnBackdrop.current = e.target === e.currentTarget;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownOnBackdrop.current && e.target === e.currentTarget) {
      onClose();
    }
    mouseDownOnBackdrop.current = false;
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-black/50 animate-fade-in"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`flex flex-col w-full ${sizeClasses[modalSize]} max-h-[90dvh] bg-surface border border-line rounded-xl shadow-xl text-left outline-none animate-modal-in`}
      >
        {(title || subtitle || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-4 sm:px-6 pt-4 sm:pt-5">
            <div className="min-w-0 pt-1.5">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink-1">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-ink-3 mt-0.5">{subtitle}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 shrink-0 inline-flex items-center justify-center min-w-11 min-h-11 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-red-500 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4">
          {children}
        </div>

        {footer && (
          <div className="px-4 sm:px-6 py-3 border-t border-line bg-surface-sunken rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
