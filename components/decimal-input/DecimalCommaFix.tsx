"use client";

import { useEffect } from "react";

// El teclado decimal del móvil en es-EC muestra "," como separador, pero type="number" la descarta.
// Los campos decimales usan type="text" inputMode="decimal" y aquí la coma se cambia por punto
// antes de que React lea el valor (captura en document corre antes que el listener raíz de React).
// Se usa el setter nativo para no actualizar el tracker de React y que onChange igual se dispare.
const nativeValueSetter = typeof window !== "undefined"
    ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
    : undefined;

const sanitize = (raw: string) => {
    let value = raw.replace(/,/g, ".").replace(/[^\d.-]/g, "");
    // Solo un punto decimal y el signo al inicio
    const firstDot = value.indexOf(".");
    if (firstDot !== -1) value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
    return value.charAt(0) + value.slice(1).replace(/-/g, "");
};

export const DecimalCommaFix = () => {
    useEffect(() => {
        const handleInput = (event: Event) => {
            const input = event.target;
            if (!(input instanceof HTMLInputElement) || input.inputMode !== "decimal" || input.type !== "text") return;

            const value = sanitize(input.value);
            if (value === input.value || !nativeValueSetter) return;

            const caret = input.selectionStart ?? value.length;
            const removed = input.value.length - value.length;
            nativeValueSetter.call(input, value);
            const position = Math.max(0, caret - removed);
            input.setSelectionRange(position, position);
        };

        document.addEventListener("input", handleInput, true);
        return () => document.removeEventListener("input", handleInput, true);
    }, []);

    return null;
};
