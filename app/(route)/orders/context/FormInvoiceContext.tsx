"use client";

import { createContext, useState, useContext, useEffect, useMemo, ReactNode, SetStateAction, Dispatch } from "react";
import { AditionalInformation, OrderCreateProps, PayMethod, ProductOutput, VoucherType } from "@/types/order";
import { getCreateInvoice, getInvoice } from "../services/invoiceServices";
import { initialProductItem } from "@/constants/initialValues";
import { calculateInvoiceTotals, calculateLineTotal, findHoliday, hasIceApplied, withHolidayIva } from "@/helpers/invoiceTotalsHelper";
import { CustomerProps, EmisionPoint, Holiday, Repayment } from "@/types";
import { ORDER_VOUCHER_TYPE_SLUG } from "@/constants";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { getDate } from "@/helpers/dateHelper";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";

interface InvoicesContextType {
  invoice: OrderCreateProps;
  payMethods: PayMethod[];
  points: EmisionPoint[];
  voucherTypes: VoucherType[];
  selectPoint: EmisionPoint | null;
  selectCustom: CustomerProps | null;
  // Feriado que cubre la fecha de la venta (IVA diferenciado 8%); null si no aplica
  activeHoliday: Holiday | null;
  // Ajusta la tarifa de los items al feriado de la fecha de la venta
  applyHolidayIva: (items: ProductOutput[]) => ProductOutput[];
  repayment: boolean;
  repayments: Repayment[];
  errorRepayments: Record<string, Partial<Record<keyof Repayment, string>>>;
  productOutputs: ProductOutput[];
  errorProductOutputs: Record<string, Partial<Record<keyof ProductOutput, string>>>;
  aditionalInformation: AditionalInformation[];
  errorAditionalInformation: Record<string, Partial<Record<keyof AditionalInformation, string>>>;
  formErrors: Partial<Record<keyof OrderCreateProps, string>>;
  isActiveIce: boolean;
  setInvoice: Dispatch<SetStateAction<OrderCreateProps>>; // Exposed for manual fetch
  setSelectPoint: Dispatch<SetStateAction<EmisionPoint | null>>;
  setSelectCustom: Dispatch<SetStateAction<CustomerProps | null>>;
  setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
  setRepayments: Dispatch<SetStateAction<Repayment[]>>;
  setErrorRepayments: Dispatch<SetStateAction<Record<string, Partial<Record<keyof Repayment, string>>>>>;
  setErrorProductOutputs: Dispatch<SetStateAction<Record<string, Partial<Record<keyof ProductOutput, string>>>>>;
  setAditionalInformation: Dispatch<SetStateAction<AditionalInformation[]>>;
  setErrorAditionalInformation: Dispatch<SetStateAction<Record<string, Partial<Record<keyof AditionalInformation, string>>>>>;
  setFormErrors: Dispatch<SetStateAction<Partial<Record<keyof OrderCreateProps, string>>>>;
  setIsActiveIce: Dispatch<SetStateAction<boolean>>;
}

const FormInvoiceContext = createContext<InvoicesContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
  // Plantilla recurrente: solo carga catálogos (la ruta [id] no es una venta) y sin IVA de feriado
  recurring?: boolean;
}

const initialInvoice: OrderCreateProps = {
  date: getDate(),
  payment_type: 'CONTADO',
  no_iva: 0,
  base0: 0,
  base5: 0,
  base8: 0,
  base12: 0,
  base15: 0,
  iva5: 0,
  iva8: 0,
  iva: 0,
  iva15: 0,
  ice: 0,
  sub_total: 0,
  discount: 0,
  total: 0,
  description: null,
  customer_id: 0,
  received: 0,
  doc_realeted: 0,
  voucher_type_id: 1,
  pay_method: 20,
};

export const FormInvoiceProvider = ({ children, recurring = false }: Props) => {
  const [invoice, setInvoice] = useState<OrderCreateProps>(initialInvoice);
  const [selectPoint, setSelectPoint] = useState<EmisionPoint | null>(null);
  const [selectCustom, setSelectCustom] = useState<CustomerProps | null>(null);
  const [productOutputs, setProductOutputs] = useState<ProductOutput[]>([]);
  const [errorProductOutputs, setErrorProductOutputs] = useState<Record<string, Partial<Record<keyof ProductOutput, string>>>>({});
  const [payMethods, setPayMethods] = useState<PayMethod[]>([]);
  const [points, setPoints] = useState<EmisionPoint[]>([]);
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [aditionalInformation, setAditionalInformation] = useState<AditionalInformation[]>([]);
  const [errorAditionalInformation, setErrorAditionalInformation] = useState<Record<string, Partial<Record<keyof AditionalInformation, string>>>>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof OrderCreateProps, string>>>({});
  // Feriados recientes/próximos (vacío si la empresa no tiene base8)
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [repayment, setRepayment] = useState(false);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [errorRepayments, setErrorRepayments] = useState<Record<string, Partial<Record<keyof Repayment, string>>>>({});
  const [isActiveIce, setIsActiveIce] = useState(false);
  const { status } = useSession();
  const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente
  const params = useParams();

  useEffect(() => {
    const fetchEditInvoice = async () => {
      if (status !== "authenticated") return;

      if (typeof params?.id === 'string' && !recurring) {
        const { data } = await getInvoice(axiosAuth, params.id as string);
        if (data) {
          const { customers, methodOfPayments, order, order_aditionals, order_items, points, voucherTypes, holidays } = data;
          setHolidays(holidays ?? []);
          setPoints(points);
          setPayMethods(methodOfPayments);
          setVoucherTypes(voucherTypes ?? []);
          const customer = customers[0];
          setSelectCustom(customer ? {
            id: Number(customer.id),
            atts: {
              identication: customer.identication,
              name: customer.name,
              address: customer.address,
              phone: customer.phone,
              email: customer.email,
            },
          } : null);
          setAditionalInformation(order_aditionals.map((item: AditionalInformation) => ({ ...item, id: item.id + '' })));
          // Normalizamos total_iva al cargar: puede venir persistido con una fórmula
          // vieja y quedar desincronizado de lo que la fila realmente calcula ahora.
          // Unidad vendida (parent_product_id): sus características son la foto guardada en la línea
          const items = order_items.map((item: ProductOutput) => ({ ...item, id: item.id + '', total_iva: calculateLineTotal(item), characteristics: item.details ?? [] }));
          setProductOutputs(items);
          setIsActiveIce(order_items.some((item: ProductOutput) => hasIceApplied(item.ice)));
          // El header de la venta puede venir desincronizado de los items (ediciones previas
          // incompletas); se recalculan los totales al cargar para reflejar los items reales.
          setInvoice(prev => ({ ...prev, ...order, id: order.id + '', ...calculateInvoiceTotals(items) }));
        }
      } else {
        const { data } = await getCreateInvoice(axiosAuth);
        if (data) {
          const { points, methodOfPayments, pay_method, holidays, repayment, voucherTypes } = data;
          setInvoice((prev) => ({ ...prev, pay_method: pay_method ?? prev.pay_method }));
          setPoints(points);
          setPayMethods(methodOfPayments);
          setVoucherTypes(voucherTypes ?? []);
          setHolidays(holidays ?? []);
          setRepayment(repayment);
          setProductOutputs([{ ...initialProductItem, id: nanoid(), }]);
        }
      }
    }
    fetchEditInvoice();
  }, [status, axiosAuth, params?.id, recurring]);

  // La N/C replica el IVA de la factura: no se ajusta por feriado. La recurrente tampoco (se emite otro día)
  const keepIva = recurring || voucherTypes.find(vt => vt.id === Number(invoice.voucher_type_id))?.slug === ORDER_VOUCHER_TYPE_SLUG.NOTA_CREDITO;
  const activeHoliday = useMemo(
    () => keepIva ? null : findHoliday(holidays, invoice.date),
    [holidays, invoice.date, keepIva]
  );

  const applyHolidayIva = (items: ProductOutput[]) =>
    keepIva ? items : items.map(item => withHolidayIva(item, activeHoliday !== null));

  // Al cambiar la fecha (o cargar los feriados) se ajusta la tarifa de los items ya ingresados
  useEffect(() => {
    if (keepIva) return;
    const adjusted = productOutputs.map(item => withHolidayIva(item, activeHoliday !== null));
    if (adjusted.every((item, i) => item === productOutputs[i])) return;
    setProductOutputs(adjusted);
    setInvoice(prev => ({ ...prev, ...calculateInvoiceTotals(adjusted) }));
  }, [activeHoliday, keepIva]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormInvoiceContext.Provider value={{
      invoice, selectPoint, selectCustom, payMethods, points, voucherTypes, activeHoliday, applyHolidayIva, repayment, repayments, errorRepayments, productOutputs, errorProductOutputs, aditionalInformation, errorAditionalInformation, formErrors, isActiveIce,
      setInvoice, setSelectPoint, setSelectCustom, setProductOutputs, setRepayments, setErrorRepayments, setErrorProductOutputs, setAditionalInformation, setErrorAditionalInformation, setFormErrors, setIsActiveIce
    }}>
      {children}
    </FormInvoiceContext.Provider>
  );
};

export const useFormInvoice = () => {
  const context = useContext(FormInvoiceContext);
  if (!context) {
    throw new Error("FormInvoice must be used within an FormInvoiceProvider");
  }
  return context;
};