import React, { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  modalSize?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  modalSize = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        // TODO: add recip class to Dialog
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full ${sizeClasses[modalSize]} overflow-auto`}
      >
        <div className="relative">
          {title && (
            <h2 id="modal-title" className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {title}
            </h2>
          )}

          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-lg font-bold text-gray-600 dark:text-white hover:text-red-500"
              aria-label="Close modal"
            >
              ✕
            </button>
          )}

          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};