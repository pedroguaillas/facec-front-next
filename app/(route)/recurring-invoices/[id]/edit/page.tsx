"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Title } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { FormInvoiceProvider } from "../../../orders/context/FormInvoiceContext";
import { RecurringInvoiceForm } from "../../shared/RecurringInvoiceForm";
import { getRecurringInvoice } from "../../services/recurringInvoiceServices";
import { RecurringInvoice } from "@/types";

const EditRecurringInvoicePage = () => {

    const { id } = useParams<{ id: string }>();
    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const [recurring, setRecurring] = useState<RecurringInvoice | null>(null);
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (status !== 'authenticated') return;
        getRecurringInvoice(axiosAuth, id).then(({ data, error }) => {
            if (data) setRecurring(data);
            else setError(error ?? 'No se encontró la plantilla');
        });
    }, [axiosAuth, id, status]);

    return (
        <div className="dark:text-gray-300">
            <Title
                title="Editar factura recurrente"
                subTitle={recurring?.atts.name ?? 'Cargando…'}
                actions={[{ label: "Regresar", type: "link", url: `/recurring-invoices/${id}`, action: "back" }]}
            />
            <div className="md:mx-8 py-4 mt-4">
                {error && <p className="rounded-xl border border-line bg-surface p-6 text-sm text-ink-3">{error}</p>}
                {!recurring && !error && <p className="rounded-xl border border-line bg-surface p-6 text-sm text-ink-3">Cargando plantilla…</p>}
                {/* El proveedor se monta con la plantilla ya cargada para que la precarga ocurra una sola vez */}
                {recurring && (
                    <FormInvoiceProvider recurring>
                        <p className="mb-3 text-xs text-ink-3">Los cambios aplican desde la próxima emisión. Las facturas ya emitidas no cambian.</p>
                        <RecurringInvoiceForm recurring={recurring} />
                    </FormInvoiceProvider>
                )}
            </div>
        </div>
    );
};

export default EditRecurringInvoicePage;
