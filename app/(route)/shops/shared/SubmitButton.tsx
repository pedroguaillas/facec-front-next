"use client";

import { useFormShop } from '../context/FormShopContext';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { FaPaperPlane, FaRegSave, FaSpinner } from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import { shopSchema } from '@/schemas/shop-schema';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Tax } from '@/types';
import { shopStoreService, shopUpdateService } from '../services/shopsServices';
import { usePlan } from '@/lib/hooks/usePlan';
import { useShopVoucherType } from '../hooks/useShopVoucherType';

export const SubmitButton = () => {
    // Acción en curso: guardar (false) o guardar y procesar (true)
    const [pendingSend, setPendingSend] = useState<boolean | null>(null);
    const isPending = pendingSend !== null;
    const { toast } = useToast();
    const { applieWithholding, shop, productOutputs, taxes, selectPoint, setErrorShop, setErrorTaxes } = useFormShop();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const params = useParams();
    const { canUseFinance } = usePlan();
    const { withProducts } = useShopVoucherType();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, send: boolean) => {
        e.preventDefault();

        // 1. Creación del formulario
        const form = {
            ...shop,
            // Con la lista visible se manda completa (el backend reemplaza las líneas y re-sincroniza el kardex);
            // sin ella se omite la clave para que el backend conserve las líneas guardadas
            products: withProducts ? productOutputs : undefined,
            taxes,
            app_retention: applieWithholding,
            send: send,
            point_id: selectPoint?.id,
            // Sin cartera (Facturador) la compra es siempre de contado y sin origen (caja/banco)
            ...(!canUseFinance && { payment_type: 'CONTADO' as const, due_date: undefined, source_type: undefined, source_id: undefined, without_source: true }),
        };

        if (!applieWithholding) {
            delete form.serie_retencion;
            delete form.date_retention;
            form.taxes = [];
        }

        // 2. Validar el formulario
        const parsed = shopSchema.safeParse(form);

        if (!parsed.success) {
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });

            setErrorShop(formatted);

            // 🔹 Errores dentro del array `taxes`
            const errorTaxes: Record<string, Partial<Record<keyof Tax, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'taxes' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof Tax; // campo del tax
                    const taxId = form.taxes[index]?.id;
                    if (taxId) {
                        if (!errorTaxes[taxId]) errorTaxes[taxId] = {};
                        errorTaxes[taxId][field] = err.message;
                    }
                }
            });

            setErrorTaxes(errorTaxes);
            toast(Object.values(formatted)[0] ?? 'Revisa los campos marcados', 'error');
            return;
        }

        // 3. Enviar el formulario
        setPendingSend(send);

        const { error, data, errors } = (params?.id)
            ? await shopUpdateService(Number(params.id), axiosAuth, form)
            : await shopStoreService(axiosAuth, form);

        if (data) {
            toast(send ? 'Compra guardada y enviada a procesar' : 'Compra guardada');
            router.push('/shops');
            return;
        }
        setPendingSend(null);
        if (errors) {
            setErrorShop(errors);
            toast(Object.values(errors)[0] ?? 'Revisa los datos del formulario', 'error');
        } else {
            toast(error ?? 'No se pudo guardar la compra', 'error');
        }
    };

    if (params?.id && shop.state_retencion === 'AUTORIZADO') {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white transition-colors cursor-pointer hover:bg-primaryhover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {pendingSend === true ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                {pendingSend === true ? 'Procesando…' : 'Guardar y procesar'}
            </button>
            <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium border border-line-strong text-ink-2 transition-colors cursor-pointer hover:bg-surface hover:text-ink-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {pendingSend === false ? <FaSpinner className="animate-spin" /> : <FaRegSave />}
                {pendingSend === false ? 'Guardando…' : 'Solo guardar'}
            </button>
        </div>
    )
}
