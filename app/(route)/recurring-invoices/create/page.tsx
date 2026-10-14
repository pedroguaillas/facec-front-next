"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Title } from "@/components";
import { FormInvoiceProvider } from "../../orders/context/FormInvoiceContext";
import { RecurringInvoiceForm } from "../shared/RecurringInvoiceForm";

const CreateForm = () => {
    // ?from_order=ID: "Hacer recurrente" desde una venta
    const fromOrderId = useSearchParams().get('from_order');

    return (
        <FormInvoiceProvider recurring>
            <Title
                title="Factura recurrente"
                subTitle={fromOrderId ? 'Programar a partir de una venta' : 'Programar una factura que se emite sola'}
                actions={[{ label: "Regresar", type: "link", url: "/recurring-invoices", action: "back" }]}
            />
            <div className="md:mx-8 py-4 mt-4">
                <RecurringInvoiceForm fromOrderId={fromOrderId} />
            </div>
        </FormInvoiceProvider>
    );
};

const CreateRecurringInvoicePage = () => (
    <div className="dark:text-gray-300">
        <Suspense>
            <CreateForm />
        </Suspense>
    </div>
);

export default CreateRecurringInvoicePage;
