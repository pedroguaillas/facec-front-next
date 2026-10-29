"use client";

import { useFormShop } from '../context/FormShopContext';
import { uploadReceiptFile } from "@/components/payment-receipt/usePaymentReceipt";
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
import { useProductTemplates } from '@/lib/hooks/useProductTemplates';
import { pickTemplateDetails, templateFieldsOf, validateTemplateDetails } from '@/helpers/productTemplateHelper';
import { storeProviderProductCode } from '@/services/providerProductCodeServices';

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
    const templates = useProductTemplates();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, send: boolean) => {
        e.preventDefault();

        // Líneas de unidades nuevas (ej. motos): `unit` con los campos de nivel unidad y `unit_code`
        // solo si la plantilla no arma el código. El backend crea la unidad y la línea apunta a ella
        const unitErrors: Record<string, string> = {};
        const products = productOutputs.map(({ unit_template_id, unit, unit_code, xml, ...item }, index) => {
            // Línea del XML sin producto vinculado
            if (xml && !item.product_id) unitErrors[`products.${index}.product_id`] = 'Busca el producto o servicio de esta línea';
            const template = templates.find(t => t.id === unit_template_id);
            if (!unit_template_id || !template) return item;
            const fields = templateFieldsOf(template, 'unidad');
            const values = pickTemplateDetails(fields, unit);
            Object.entries(validateTemplateDetails(fields, values)).forEach(([key, msg]) => { unitErrors[`products.${index}.unit.${key}`] = msg; });
            if (!template.code_field_id && !unit_code?.trim()) unitErrors[`products.${index}.unit_code`] = 'Código requerido';
            return { ...item, quantity: 1, presentation_id: null, unit: values, unit_code: template.code_field_id ? null : unit_code?.trim() ?? null };
        });
        if (withProducts && Object.keys(unitErrors).length > 0) {
            setErrorShop(unitErrors);
            const unlinked = Object.keys(unitErrors).some(key => key.endsWith('.product_id'));
            toast(unlinked ? 'Vincula los productos del XML' : 'Completa los datos de las unidades', 'error');
            return;
        }

        // 1. Creación del formulario
        const form = {
            ...shop,
            // Con la lista visible se manda completa (el backend reemplaza las líneas y re-sincroniza el kardex);
            // sin ella se omite la clave para que el backend conserve las líneas guardadas
            products: withProducts ? products : undefined,
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
        // Comprobante del pago con banco (solo al crear): se sube primero y el documento lleva su id
        const { receipt, receipt_number, ...payload } = form;
        const withReceipt = !params?.id && canUseFinance && payload.payment_type === 'CONTADO' && payload.source_type === 'bank_account';
        const { receipt_id, error: receiptUploadError }: { receipt_id?: number; error?: string } = withReceipt ? await uploadReceiptFile(axiosAuth, receipt) : {};
        if (receiptUploadError) {
            setPendingSend(null);
            setErrorShop(prev => ({ ...prev, receipt: receiptUploadError }));
            toast(receiptUploadError, 'error');
            return;
        }

        const { error, data, errors } = (params?.id)
            ? await shopUpdateService(Number(params.id), axiosAuth, payload)
            : await shopStoreService(axiosAuth, { ...payload, receipt_id, ...(withReceipt && receipt_number?.trim() && { receipt_number: receipt_number.trim() }) });

        if (data) {
            await rememberProviderCodes(Number(form.provider_id));
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

    // Líneas del XML vinculadas a mano con "Recordar": la próxima factura del proveedor las encuentra solas
    const rememberProviderCodes = async (providerId: number) => {
        if (!withProducts || !providerId) return;
        const links = new Map<string, number>();
        productOutputs.forEach(({ xml, product_id }) => {
            if (xml?.match === 'manual' && xml.remember && xml.code && product_id) links.set(xml.code, product_id);
        });
        // Si falla (ej. el código ya estaba vinculado) la compra igual quedó guardada
        await Promise.allSettled([...links].map(([code, product_id]) => storeProviderProductCode(axiosAuth, providerId, { code, product_id })));
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
