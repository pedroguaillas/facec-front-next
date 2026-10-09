"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ZodType, ZodTypeDef } from "zod";
import { IDENTIFICATION_LENGTH, IdentificationType, isNumericIdentification, LookupStatus } from "@/components/identification-fields/IdentificationFields";
import { useFormSubmit } from "./useFormSubmit";
import { ApiResponse } from "@/types";

interface PartyBase {
    type_identification: IdentificationType;
    identication: string;
}

type ResolvedParty<T> = Partial<T> & { branch_id?: number };

interface Options<T extends PartyBase> {
    // Si viene, el formulario está en modo edición
    id?: string;
    initial: T;
    schema: ZodType<object, ZodTypeDef, object>;
    fetch: (id: string) => Promise<ApiResponse<T>>;
    save: (form: object, id?: string) => Promise<ApiResponse<unknown>>;
    // Busca la identificación en la base de datos / SRI para autocompletar
    resolve: (identication: string) => Promise<ApiResponse<ResolvedParty<T>>>;
    // Campos que se autocompletan con el resultado de `resolve`
    fillFields: (keyof T)[];
    // Mensaje cuando la identificación ya está registrada en esta empresa
    duplicateMessage: string;
    // Recibe el registro guardado que devolvió la API
    onSaved: (saved?: T) => void;
}

export type PartyErrors<T> = Partial<Record<keyof T, string>>;

const trimStrings = <T extends object>(data: T): T =>
    Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    ) as T;

// Lógica común de los formularios de cliente, proveedor y transportista:
// carga para edición, autocompletado por identificación, detección de cambios y envío.
export const usePartyForm = <T extends PartyBase>(options: Options<T>) => {

    const { id, initial, schema } = options;
    const optionsRef = useRef(options);
    useEffect(() => {
        optionsRef.current = options;
    });

    const [data, setData] = useState<T>(initial);
    const [snapshot, setSnapshot] = useState<T>(initial);
    const [errors, setErrors] = useState<PartyErrors<T>>({});
    const [isLoading, setIsLoading] = useState(!!id);
    const [loadError, setLoadError] = useState<string>();
    const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');

    // Carga del registro a editar
    useEffect(() => {
        if (!id) return;

        let cancelled = false;
        optionsRef.current.fetch(id).then(({ data: loaded, error }) => {
            if (cancelled) return;
            if (loaded) {
                setData(loaded);
                setSnapshot(loaded);
            } else {
                setLoadError(error ?? 'No se pudo cargar la información');
            }
            setIsLoading(false);
        });

        return () => { cancelled = true; };
    }, [id]);

    // Autocompletado al completar cédula / RUC (solo al registrar)
    const { type_identification: type, identication } = data;
    useEffect(() => {
        const value = identication.trim();
        if (id || !isNumericIdentification(type) || value.length !== IDENTIFICATION_LENGTH[type]) {
            setLookupStatus('idle');
            return;
        }

        let cancelled = false;
        setLookupStatus('searching');

        const { resolve, fillFields, duplicateMessage } = optionsRef.current;
        resolve(value).then(({ data: found }) => {
            if (cancelled) return;

            if (!found) {
                setLookupStatus('idle');
                return;
            }

            if (found.branch_id) {
                setErrors(prev => ({ ...prev, identication: duplicateMessage }));
                setLookupStatus('idle');
                return;
            }

            const fill: Partial<T> = {};
            fillFields.forEach(field => {
                if (found[field] !== undefined && found[field] !== null) fill[field] = found[field] as T[keyof T];
            });
            setData(prev => ({ ...prev, ...fill }));
            setErrors(prev => {
                const next = { ...prev };
                fillFields.forEach(field => delete next[field]);
                return next;
            });
            setLookupStatus('found');
        });

        return () => { cancelled = true; };
    }, [id, type, identication]);

    const clearError = (field: keyof T) => {
        setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev));
    };

    const setField = <K extends keyof T>(field: K, value: T[K]) => {
        setData(prev => ({ ...prev, [field]: value }));
        clearError(field);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setField(name as keyof T, value as T[keyof T]);
    };

    // Al cambiar el tipo se recorta la identificación al nuevo largo máximo
    const setType = (newType: IdentificationType) => {
        setData(prev => {
            const value = isNumericIdentification(newType)
                ? prev.identication.replace(/\D/g, '')
                : prev.identication;
            return { ...prev, type_identification: newType, identication: value.slice(0, IDENTIFICATION_LENGTH[newType]) };
        });
        clearError('identication');
    };

    const setIdentification = (value: string) => setField('identication', value as T['identication']);

    const trimmed = useMemo(() => trimStrings(data), [data]);
    const isDirty = useMemo(() => JSON.stringify(trimmed) !== JSON.stringify(trimStrings(snapshot)), [trimmed, snapshot]);

    const { handleSubmit, isPending, message } = useFormSubmit<object>({
        schema,
        data: trimmed,
        setErrors: (formErrors) => setErrors(formErrors as PartyErrors<T>),
        onSubmit: (form) => optionsRef.current.save(form, id),
        onSuccess: (saved) => optionsRef.current.onSaved(saved as T | undefined),
    });

    return {
        data,
        errors,
        // Si falló la carga se mantiene bloqueado para no guardar un formulario vacío
        isLoading: isLoading || !!loadError,
        isDirty,
        isPending,
        message: loadError ?? message,
        lookupStatus,
        handleChange,
        setField,
        setType,
        setIdentification,
        handleSubmit,
    };
};
