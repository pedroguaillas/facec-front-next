"use client";

import { useFormInvoice } from "../context/FormInvoiceContext";
import { ORDER_VOUCHER_TYPE_SLUG, TRANSPORT_AUX_COD_PREFIX } from "@/constants";
import { usePlan } from "@/lib/hooks/usePlan";
import { FormSection } from "./FormSection";
import { PayMethods } from "./PayMethods";
import { PaymentInformation } from "./PaymentInformation";
import { Plate } from "./Plate";

// Agrupa placa (transporte), forma de pago SRI y cobro (contado / crédito / anticipo).
// Cada parte decide si se muestra; la sección se oculta si ninguna aplica.
export const PaymentSection = () => {

    const { invoice, voucherTypes, productOutputs } = useFormInvoice();
    const { canUseFinance } = usePlan();

    const isFactura = voucherTypes.find((vt) => vt.id === Number(invoice.voucher_type_id))?.slug === ORDER_VOUCHER_TYPE_SLUG.FACTURA;
    const hasPlate = !!invoice.plate || productOutputs.some(item => item.aux_cod?.startsWith(TRANSPORT_AUX_COD_PREFIX));

    if (!isFactura && !canUseFinance && !hasPlate) return null;

    return (
        <FormSection title="Pago">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <PaymentInformation />
                <PayMethods />
                <Plate />
            </div>
        </FormSection>
    );
};
