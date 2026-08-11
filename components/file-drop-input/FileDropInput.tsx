"use client";

import { ChangeEvent, DragEvent, ReactNode, useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";

interface FileDropInputProps {
    name: string;
    label: string;
    accept?: string;
    file?: File | null;
    icon: ReactNode;
    imagePreview?: boolean;
    existingUrl?: string | null;
    existingLabel?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
}

export const FileDropInput = ({
    name,
    label,
    accept,
    file,
    icon,
    imagePreview,
    existingUrl,
    existingLabel,
    onChange,
    onClear,
}: FileDropInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    useEffect(() => {
        if (imagePreview && file) {
            const url = URL.createObjectURL(file);
            setLocalPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setLocalPreview(null);
    }, [file, imagePreview]);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile || !inputRef.current) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        inputRef.current.files = dataTransfer.files;
        inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const previewSrc = localPreview ?? (imagePreview && !file ? existingUrl : null);

    return (
        <div className="flex flex-col gap-1.5 my-2">
            <label className="text-sm font-medium">{label}</label>
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                    relative flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3
                    cursor-pointer transition-colors duration-150
                    ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-[var(--border-strong)] hover:border-primary'
                    }
                `}
            >
                {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewSrc} alt={label} className="w-12 h-12 object-contain rounded bg-[var(--background)] shrink-0" />
                ) : (
                    <div className="w-12 h-12 rounded flex items-center justify-center bg-[var(--background)] text-lg opacity-60 shrink-0">
                        {icon}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                        {file?.name || existingLabel || 'Arrastra un archivo aquí o haz clic para seleccionar'}
                    </p>
                    {accept && <p className="text-xs opacity-50 truncate">{accept}</p>}
                </div>

                {file && onClear && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        className="shrink-0 p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-950 text-danger"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={onChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};
