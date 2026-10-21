"use client";

import { AditionalInformation, ProductOutput } from '@/types/order';
import { useFormInvoice } from '../context/FormInvoiceContext';
import { invoiceSchema } from '@/schemas/invoice.schema';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useRouter, useParams } from 'next/navigation';
import { FaPaperPlane, FaRegSave, FaSpinner } from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';
import { Repayment } from '@/types';
import { invoiceStoreServices, invoiceUpdateServices } from '../services/invoiceServices';
import { calculateInvoiceTotals } from '@/helpers/invoiceTotalsHelper';
import { ORDER_VOUCHER_TYPE_SLUG } from '@/constants';
import { usePlan } from '@/lib/hooks/usePlan';
import { useSession } from 'next-auth/react';
import { PrintTicketPanel } from './PrintTicketPanel';

export const ButtonSubmit = () => {

    const { invoice, selectPoint, productOutputs, aditionalInformation, repayments, voucherTypes, setFormErrors, setErrorProductOutputs, setErrorRepayments, setErrorAditionalInformation } = useFormInvoice();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    // Acción en curso: guardar (false) o guardar y procesar (true)
    const [pendingSend, setPendingSend] = useState<boolean | null>(null);
    const isPending = pendingSend !== null;
    const { toast } = useToast();
    const params = useParams();
    const { canUseFinance } = usePlan();
    const { data: session } = useSession();
    // Venta recién guardada cuyo ticket se imprime antes de volver a la lista
    const [printOrder, setPrintOrder] = useState<{ id: string | number; serie?: string } | null>(null);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, send: boolean) => {
        e.preventDefault();

        // 1. Creación del formulario
        // Los totales de la factura siempre se recalculan desde los items actuales
        // para evitar enviar valores desincronizados (p. ej. si el header quedó
        // con totales viejos y los items ya cambiaron).
        const form = {
            ...invoice,
            ...calculateInvoiceTotals(productOutputs),
            products: productOutputs,
            send: send,
            aditionals: aditionalInformation.map(aditional => ({
                id: aditional.id,
                name: aditional.name.trim(),
                description: aditional.description.trim(),
            })),
            point_id: selectPoint?.id,
            repayments,
            // Sin cartera (Facturador) la venta es siempre de contado y sin origen (caja/banco)
            ...(!canUseFinance && { payment_type: 'CONTADO' as const, due_date: undefined, source_type: undefined, source_id: undefined, without_source: true }),
            // Con cartera la forma de pago SRI sale del cobro: efectivo en caja = 01, el resto = 20
            ...(canUseFinance && { pay_method: invoice.payment_type === 'CONTADO' && invoice.source_type === 'cash_register_session' ? 1 : 20 }),
        };

        const selectedVoucherType = voucherTypes.find((vt) => vt.id === Number(form.voucher_type_id));
        if (selectedVoucherType?.slug === ORDER_VOUCHER_TYPE_SLUG.NOTA_CREDITO && form.reason) {
            form.reason = form.reason.trim();
        }

        // 2. Validar el formulario
        const parsed = invoiceSchema.safeParse(form);

        if (!parsed.success) {
            console.log('Validación ', parsed.error)
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });
            // Forma de pago oculta (plan Financiero): el límite de efectivo se muestra en caja/banco
            if (canUseFinance && formatted.pay_method) {
                formatted.source_id = 'Desde $500 el cobro debe ir a un banco';
                delete formatted.pay_method;
            }

            setFormErrors(formatted);

            // 🔹 Errores dentro del array `products`
            const productErrors: Record<string, Partial<Record<keyof ProductOutput, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'products' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof ProductOutput; // campo del producto
                    const productId = form.products[index]?.id;
                    if (productId) {
                        if (!productErrors[productId]) productErrors[productId] = {};
                        productErrors[productId][field] = err.message;
                    }
                }
            });

            setErrorProductOutputs(productErrors); // ← Necesitas este estado para manejar errores por producto

            // 🔹 Errores dentro del array `repaymentErrors`
            const repaymentErrors: Record<string, Partial<Record<keyof Repayment, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'repayments' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof Repayment; // campo del producto
                    const repaymentId = form.repayments[index]?.id;
                    if (repaymentId) {
                        if (!repaymentErrors[repaymentId]) repaymentErrors[repaymentId] = {};
                        repaymentErrors[repaymentId][field] = err.message;
                    }
                }
            });

            setErrorRepayments(repaymentErrors);

            // 🔹 Errores dentro del array `aditionals`
            const aditionalErrors: Record<string, Partial<Record<keyof AditionalInformation, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'aditionals' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof AditionalInformation; // campo del producto
                    const aditionalId = form.aditionals[index]?.id;
                    if (aditionalId) {
                        if (!aditionalErrors[aditionalId]) aditionalErrors[aditionalId] = {};
                        aditionalErrors[aditionalId][field] = err.message;
                    }
                }
            });

            setErrorAditionalInformation(aditionalErrors); // ← Necesitas este estado para manejar errores por producto

            return;
        }

        // 3. Enviar el formulario
        setPendingSend(send);

        const { data, error, errors } = await (params.id ? invoiceUpdateServices(axiosAuth, params.id.toString(), form) : invoiceStoreServices(axiosAuth, form));
        if (data) {
            toast(send ? 'Venta guardada y enviada a procesar' : 'Venta guardada');
            // Imprime tickets y está en computadora (mouse): ticket listo e impresión automática.
            // En celular/tablet se sigue imprimiendo desde la lista (compartir/abrir el PDF)
            const savedId = data.id ?? params.id?.toString();
            const printsTickets = !!session?.user.permissions.printf && window.matchMedia('(pointer: fine)').matches;
            if (printsTickets && savedId) {
                setPrintOrder({ id: savedId, serie: (data as { serie?: string }).serie });
                return;
            }
            router.push(`/orders`);
            return;
        }
        setPendingSend(null);
        if (errors) {
            setFormErrors(errors);
            // Con inventario: "Stock insuficiente de ..." (errors.products) tiene prioridad
            toast(errors.products ?? Object.values(errors)[0] ?? 'Revisa los datos del formulario', 'error');
        } else {
            toast(error ?? 'No se pudo guardar la venta', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {printOrder && (
                <PrintTicketPanel orderId={printOrder.id} serie={printOrder.serie} onDone={() => router.push('/orders')} />
            )}
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
