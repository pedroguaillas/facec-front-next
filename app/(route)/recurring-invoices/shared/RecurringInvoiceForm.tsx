"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { FaSpinner } from "react-icons/fa6";
import { LabelComponent, SegmentedControl, SelectCustomer, SelectOption, Switch, TextInput } from "@/components";
import { useFormInvoice } from "../../orders/context/FormInvoiceContext";
import { AditionalInformation, ListProducts } from "../../orders/shared";
import { FormSection } from "../../orders/shared/FormSection";
import { getInvoice } from "../../orders/services/invoiceServices";
import { storeRecurringInvoice, updateRecurringInvoice } from "../services/recurringInvoiceServices";
import { RecurringSourceSelect } from "./RecurringSourceSelect";
import { RecurringSummary } from "./RecurringSummary";
import { RecurringLineText } from "./RecurringLineText";
import { recurringInvoiceSchema } from "@/schemas/recurring-invoice.schema";
import { CONSUMIDOR_FINAL_IDENTICATION, IVA_PERCENTAGE_BY_CODE, MAX_RECURRING_ADITIONALS, RECURRING_PLACEHOLDERS, recurringFrequencyOptions } from "@/constants";
import { calculateInvoiceTotals, calculateLineTotal } from "@/helpers/invoiceTotalsHelper";
import { fillPlaceholders, hasPlaceholders, upcomingRunDates } from "@/helpers/recurrenceHelper";
import { addDaysToDate, getDate } from "@/helpers/dateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { usePlan } from "@/lib/hooks/usePlan";
import { useToast } from "@/context/ToastContext";
import { AditionalInformation as AditionalInformationType, CustomerProps, ProductOutput, RecurringFrequency, RecurringInvoice, RecurringInvoiceForm as FormValues, RecurringSourceType } from "@/types";

type Ending = 'never' | 'date' | 'count';
type FormErrors = Partial<Record<keyof FormValues | 'customer_id' | 'products', string>>;

interface Props {
    // Edición: plantilla guardada
    recurring?: RecurringInvoice;
    // Creación desde una venta ("Hacer recurrente")
    fromOrderId?: string | null;
}

const initialForm: FormValues = {
    name: '',
    emision_point_id: '',
    frequency: 'MENSUAL',
    // Mañana 08:00: no sale nada apenas se guarda
    start_at: `${addDaysToDate(getDate(), 1)}T08:00`,
    end_date: '',
    max_occurrences: '',
    auto_send: true,
    payment_type: 'CONTADO',
    due_days: '',
    pay_method: 20,
    source_type: '',
    source_id: '',
    description: '',
};

const endingOptions: { label: string; value: Ending }[] = [
    { label: 'Nunca', value: 'never' },
    { label: 'En una fecha', value: 'date' },
    { label: 'Tras N facturas', value: 'count' },
];

// Días entre dos fechas YYYY-MM-DD
const daysBetween = (from: string, to: string) => {
    const [y1, m1, d1] = from.slice(0, 10).split('-').map(Number);
    const [y2, m2, d2] = to.slice(0, 10).split('-').map(Number);
    return Math.max(0, Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000));
};

interface SavedLine {
    product_id: number;
    name?: string;
    product_code?: string;
    // Propios de la plantilla (la venta no los precarga: las facturas viejas no los tienen)
    custom_code?: string | null;
    custom_description?: string | null;
    quantity: number | string;
    price: number | string;
    discount: number | string;
    iva: number;
}

// Item guardado (plantilla o venta) → línea editable del formulario de venta
const toProductOutput = (item: SavedLine): ProductOutput => {
    const line: ProductOutput = {
        id: nanoid(),
        product_id: item.product_id,
        name: item.name,
        product_code: item.product_code,
        custom_code: item.custom_code ?? '',
        custom_description: item.custom_description ?? '',
        aux_cod: null,
        quantity: Number(item.quantity),
        price: Number(item.price),
        discount: Number(item.discount ?? 0),
        stock: 1,
        iva: Number(item.iva),
        percentage: IVA_PERCENTAGE_BY_CODE[Number(item.iva)] ?? 0,
        total_iva: 0,
        ice: undefined,
    };
    return { ...line, total_iva: calculateLineTotal(line) };
};

export const RecurringInvoiceForm = ({ recurring, fromOrderId }: Props) => {

    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { canUseFinance } = usePlan();
    const {
        invoice, points, payMethods, selectCustom, productOutputs, aditionalInformation,
        setInvoice, setSelectCustom, setProductOutputs, setAditionalInformation,
        setErrorProductOutputs, setErrorAditionalInformation,
    } = useFormInvoice();

    const [form, setForm] = useState<FormValues>(initialForm);
    const [ending, setEnding] = useState<Ending>('never');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const prefilled = useRef(false);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // Precarga cuando el contexto ya trajo los catálogos (si no, su línea vacía pisaría los items)
    useEffect(() => {
        if (points.length === 0 || prefilled.current) return;
        prefilled.current = true;

        const loadCustomer = (customer: CustomerProps) => {
            setSelectCustom(customer);
            setInvoice(prev => ({ ...prev, customer_id: customer.id }));
        };
        const loadItems = (items: ProductOutput[]) => {
            setProductOutputs(items);
            setInvoice(prev => ({ ...prev, ...calculateInvoiceTotals(items) }));
        };

        if (recurring) {
            const { atts, customer } = recurring;
            setForm({
                name: atts.name,
                emision_point_id: atts.emision_point_id ?? '',
                frequency: atts.frequency,
                start_at: atts.start_at.replace(' ', 'T'),
                end_date: atts.end_date ?? '',
                max_occurrences: atts.max_occurrences ? String(atts.max_occurrences) : '',
                auto_send: atts.auto_send,
                payment_type: atts.payment_type,
                due_days: atts.due_days !== null ? String(atts.due_days) : '',
                pay_method: atts.pay_method ?? 20,
                source_type: atts.source_type ?? '',
                source_id: atts.source_id ?? '',
                description: atts.description ?? '',
            });
            setEnding(atts.end_date ? 'date' : atts.max_occurrences ? 'count' : 'never');
            loadCustomer({ id: customer.id, atts: { identication: customer.identication, name: customer.name, email: customer.email ?? undefined } });
            loadItems((recurring.items ?? []).map(item => toProductOutput({
                ...item,
                custom_code: item.code,
                custom_description: item.description,
            })));
            setAditionalInformation((atts.aditionals ?? []).map(it => ({ id: nanoid(), name: it.name, description: it.description })));
            return;
        }

        setForm(prev => ({ ...prev, emision_point_id: points.length === 1 ? points[0].id : '' }));

        if (!fromOrderId) return;
        getInvoice(axiosAuth, fromOrderId).then(({ data }) => {
            if (!data) return;
            const { order, customers, order_items, order_aditionals } = data;
            const customer = customers[0];
            if (customer && customer.identication !== CONSUMIDOR_FINAL_IDENTICATION) {
                loadCustomer({ id: Number(customer.id), atts: { identication: customer.identication, name: customer.name, email: customer.email ?? undefined } });
            }
            loadItems(order_items.map(item => toProductOutput({ product_id: item.product_id, name: item.name, quantity: item.quantity, price: item.price, discount: item.discount, iva: Number(item.iva ?? 0) })));
            setAditionalInformation(order_aditionals.slice(0, MAX_RECURRING_ADITIONALS).map((it: AditionalInformationType) => ({ id: nanoid(), name: it.name, description: it.description })));
            const isCredit = order.payment_type === 'CREDITO';
            setForm(prev => ({
                ...prev,
                payment_type: isCredit ? 'CREDITO' : 'CONTADO',
                due_days: isCredit && order.due_date ? String(daysBetween(order.date, order.due_date)) : prev.due_days,
                pay_method: order.pay_method ?? prev.pay_method,
                // La venta guarda la sesión de caja; solo el banco se puede reutilizar tal cual
                ...(order.source_type === 'bank_account' && order.source_id && { source_type: 'bank_account' as const, source_id: order.source_id }),
                description: order.description ?? '',
            }));
        });
    }, [points]); // eslint-disable-line react-hooks/exhaustive-deps

    const setField = <K extends keyof FormValues>(name: K, value: FormValues[K]) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setField(e.target.name as keyof FormValues, e.target.value as never);

    const handleEnding = (value: Ending) => {
        setEnding(value);
        setForm(prev => ({
            ...prev,
            end_date: value === 'date' ? prev.end_date : '',
            max_occurrences: value === 'count' ? prev.max_occurrences : '',
        }));
        setErrors(prev => ({ ...prev, end_date: '', max_occurrences: '' }));
    };

    const handleSelectCustomer = (customer: CustomerProps) => {
        setSelectCustom(customer);
        setInvoice(prev => ({ ...prev, customer_id: customer.id }));
        setErrors(prev => ({ ...prev, customer_id: '' }));
    };

    const handleSource = (source_type: RecurringSourceType, source_id: number) => {
        setForm(prev => ({ ...prev, source_type, source_id }));
        setErrors(prev => ({ ...prev, source_type: '', source_id: '' }));
    };

    // Inserta el marcador donde está el cursor de la descripción
    const insertPlaceholder = (token: string) => {
        const el = descriptionRef.current;
        const start = el?.selectionStart ?? form.description.length;
        const end = el?.selectionEnd ?? form.description.length;
        const next = (form.description.slice(0, start) + token + form.description.slice(end)).slice(0, 300);
        setField('description', next);
        requestAnimationFrame(() => {
            el?.focus();
            el?.setSelectionRange(start + token.length, start + token.length);
        });
    };

    const remaining = form.max_occurrences
        ? Math.max(0, Number(form.max_occurrences) - (recurring?.atts.emitted_count ?? 0))
        : null;
    const upcoming = upcomingRunDates(form.start_at, form.frequency, {
        from: getDate(),
        count: 3,
        endDate: form.end_date || null,
        remaining,
    });

    // Con plan financiero la forma de pago SRI sale del cobro: efectivo en caja = 01, el resto = 20
    const payMethod = canUseFinance
        ? (form.payment_type === 'CONTADO' && form.source_type === 'cash_register' ? 1 : 20)
        : form.pay_method;

    const handleSubmit = async () => {
        const parsed = recurringInvoiceSchema.safeParse({
            ...form,
            pay_method: payMethod,
            customer_id: invoice.customer_id,
            customer_identication: selectCustom?.atts.identication,
            products: productOutputs,
            aditionals: aditionalInformation,
            requires_source: canUseFinance,
        });

        if (!parsed.success) {
            const formatted: FormErrors = {};
            const productErrors: Record<string, Partial<Record<keyof ProductOutput, string>>> = {};
            const aditionalErrors: Record<string, Partial<Record<keyof AditionalInformationType, string>>> = {};
            parsed.error.errors.forEach(err => {
                const [field, index, sub] = err.path;
                if (field === 'products' && typeof index === 'number') {
                    const id = productOutputs[index]?.id;
                    if (id) productErrors[id] = { ...productErrors[id], [sub]: err.message };
                } else if (field === 'aditionals' && typeof index === 'number') {
                    const id = aditionalInformation[index]?.id;
                    if (id) aditionalErrors[id] = { ...aditionalErrors[id], [sub]: err.message };
                } else {
                    formatted[field as keyof FormErrors] ??= err.message;
                }
            });
            setErrors(formatted);
            setErrorProductOutputs(productErrors);
            setErrorAditionalInformation(aditionalErrors);
            toast(Object.values(formatted)[0] ?? 'Revisa los productos y campos marcados', 'error');
            return;
        }

        const { customer_identication: _ci, requires_source: _rs, ...data } = parsed.data; // eslint-disable-line @typescript-eslint/no-unused-vars
        const payload = {
            ...data,
            due_days: data.payment_type === 'CREDITO' ? data.due_days : null,
            source_type: data.payment_type === 'CONTADO' ? data.source_type : null,
            source_id: data.payment_type === 'CONTADO' ? data.source_id : null,
            products: data.products.map(p => ({
                product_id: p.product_id,
                code: p.custom_code || null,
                description: p.custom_description || null,
                quantity: p.quantity,
                price: p.price,
                discount: p.discount,
                iva: p.iva ?? 0,
            })),
            aditionals: data.aditionals.map(({ name, description }) => ({ name, description })),
        };

        setIsSaving(true);
        const response = recurring
            ? await updateRecurringInvoice(axiosAuth, String(recurring.id), payload)
            : await storeRecurringInvoice(axiosAuth, payload);
        setIsSaving(false);

        if (response.data) {
            toast(recurring ? 'Plantilla actualizada' : 'Factura recurrente programada');
            router.push(`/recurring-invoices/${response.data.id}`);
            return;
        }
        if (response.errors) {
            // 422 de Laravel: "products.0.iva" / "aditionals.1.name" van a su fila
            const formatted: FormErrors = {};
            const productErrors: Record<string, Partial<Record<keyof ProductOutput, string>>> = {};
            const aditionalErrors: Record<string, Partial<Record<keyof AditionalInformationType, string>>> = {};
            Object.entries(response.errors).forEach(([key, message]) => {
                const [field, index, sub] = key.split('.');
                if (field === 'products' && index !== undefined) {
                    const id = productOutputs[Number(index)]?.id;
                    const lineField = ({ iva: 'product_id', code: 'custom_code', description: 'custom_description' } as Record<string, string>)[sub] ?? sub;
                    if (id) productErrors[id] = { ...productErrors[id], [lineField]: message };
                } else if (field === 'aditionals' && index !== undefined) {
                    const id = aditionalInformation[Number(index)]?.id;
                    if (id) aditionalErrors[id] = { ...aditionalErrors[id], [sub]: message };
                } else {
                    formatted[field as keyof FormErrors] = message;
                }
            });
            setErrors(formatted);
            setErrorProductOutputs(productErrors);
            setErrorAditionalInformation(aditionalErrors);
            toast(response.errors.products ?? Object.values(response.errors)[0] ?? 'Revisa los datos del formulario', 'error');
            return;
        }
        toast(response.error ?? 'No se pudo guardar la plantilla', 'error');
    };

    const optionPoints = points.map(point => ({ value: point.id, label: `${point.store} - ${point.point} - ${point.recognition}` }));
    const optionPayMethods = payMethods.map(pay => ({ value: pay.code, label: pay.description }));
    const preview = form.description && upcoming[0] && hasPlaceholders(form.description)
        ? fillPlaceholders(form.description, upcoming[0])
        : null;

    return (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] items-start">
            <div className="min-w-0 rounded-xl border border-line bg-surface p-4 lg:p-6">

                <FormSection title="Plantilla">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <TextInput
                            label="Nombre"
                            name="name"
                            value={form.name}
                            error={errors.name}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Ej. Mensualidad internet"
                            hint="Solo lo ves tú, no sale en la factura"
                            autoFocus={!recurring}
                            required
                        />
                        {points.length > 1 && (
                            <SelectOption
                                label="Punto de emisión"
                                name="emision_point_id"
                                options={optionPoints}
                                selectedValue={form.emision_point_id}
                                error={errors.emision_point_id}
                                handleSelect={e => setField('emision_point_id', Number(e.target.value))}
                                select
                                required
                            />
                        )}
                        <div className="flex flex-col gap-1.5 my-2 sm:col-span-2">
                            <LabelComponent name="customer" label="Cliente" required />
                            <SelectCustomer label={selectCustom ? `${selectCustom.atts.identication} - ${selectCustom.atts.name}` : ''} error={errors.customer_id} selectCustomer={handleSelectCustomer} />
                            {!errors.customer_id && <p className="text-xs text-ink-3">Debe ser un cliente identificado: no se admite consumidor final.</p>}
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Programación">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <SelectOption
                            label="Frecuencia"
                            name="frequency"
                            options={recurringFrequencyOptions}
                            selectedValue={form.frequency}
                            error={errors.frequency}
                            handleSelect={e => setField('frequency', e.target.value as RecurringFrequency)}
                            required
                        />
                        <TextInput
                            type="datetime-local"
                            label="Inicio (fecha y hora)"
                            name="start_at"
                            value={form.start_at}
                            error={errors.start_at}
                            onChange={handleChange}
                            hint="Cada factura sale ese día del período a esa hora. Si es 31, en meses cortos sale el último día."
                            required
                        />
                        <div className="sm:col-span-2">
                            <SegmentedControl label="Termina" name="ending" value={ending} options={endingOptions} onChange={handleEnding} />
                        </div>
                        {ending === 'date' && (
                            <TextInput type="date" label="Última fecha" name="end_date" value={form.end_date} error={errors.end_date} onChange={handleChange} min={form.start_at.slice(0, 10)} required />
                        )}
                        {ending === 'count' && (
                            <TextInput
                                type="number"
                                label="Cantidad de facturas"
                                name="max_occurrences"
                                value={form.max_occurrences}
                                error={errors.max_occurrences}
                                onChange={handleChange}
                                min="1"
                                inputMode="numeric"
                                hint={recurring?.atts.emitted_count ? `Ya emitió ${recurring.atts.emitted_count}` : undefined}
                                required
                            />
                        )}
                        <div className="sm:col-span-2 mt-2">
                            <Switch
                                name="auto_send"
                                label="Enviar al SRI automáticamente"
                                checked={form.auto_send}
                                onChange={e => setField('auto_send', e.target.checked)}
                                description={form.auto_send
                                    ? 'Se emite, se autoriza y se envía al cliente sin que hagas nada.'
                                    : 'Queda creada en Ventas para que la revises y la proceses tú.'}
                            />
                        </div>
                    </div>
                </FormSection>

                <ListProducts withPresentations={false} renderLineExtra={item => <RecurringLineText item={item} previewDate={upcoming[0]} />} />
                {errors.products && <p className="-mt-3 mb-3 text-xs text-red-500">{errors.products}</p>}

                <FormSection title="Cobro">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        {canUseFinance && (
                            <SelectOption
                                label="Condición de pago"
                                name="payment_type"
                                options={[{ value: 'CONTADO', label: 'Contado' }, { value: 'CREDITO', label: 'Crédito' }]}
                                selectedValue={form.payment_type}
                                error={errors.payment_type}
                                handleSelect={e => {
                                    setField('payment_type', e.target.value as FormValues['payment_type']);
                                    if (e.target.value === 'CREDITO' && !form.due_days) setField('due_days', '30');
                                }}
                                required
                            />
                        )}
                        {form.payment_type === 'CREDITO' ? (
                            <TextInput
                                type="number"
                                label="Días de plazo"
                                name="due_days"
                                value={form.due_days}
                                error={errors.due_days}
                                onChange={handleChange}
                                min="0"
                                max="365"
                                inputMode="numeric"
                                hint="Se cuentan desde la fecha de cada factura"
                                required
                            />
                        ) : canUseFinance ? (
                            <RecurringSourceSelect
                                sourceType={form.source_type}
                                sourceId={form.source_id}
                                error={errors.source_id || errors.source_type}
                                onChange={handleSource}
                            />
                        ) : (
                            <SelectOption
                                label="Forma de pago"
                                name="pay_method"
                                options={optionPayMethods}
                                selectedValue={form.pay_method}
                                error={errors.pay_method}
                                handleSelect={e => setField('pay_method', Number(e.target.value))}
                            />
                        )}
                    </div>
                </FormSection>

                <FormSection title="Descripción">
                    <label htmlFor="recurring-description" className="sr-only">Descripción</label>
                    <textarea
                        id="recurring-description"
                        ref={descriptionRef}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        maxLength={300}
                        rows={2}
                        placeholder="Ej. Servicio de internet {periodo}"
                        aria-invalid={errors.description ? 'true' : 'false'}
                        className={`w-full border rounded-lg px-3 py-2 text-sm bg-[var(--background)] text-ink-1 focus:outline-none focus:ring-2 transition-colors ${errors.description ? 'border-red-400 focus:ring-red-500/15' : 'border-[var(--border-strong)] focus:border-primary focus:ring-primary/15'}`}
                    />
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-ink-3">Insertar:</span>
                        {RECURRING_PLACEHOLDERS.map(token => (
                            <button
                                key={token}
                                type="button"
                                onClick={() => insertPlaceholder(token)}
                                className="rounded-md border border-line-strong px-1.5 py-0.5 font-mono text-ink-2 hover:border-brand-ink hover:text-brand-ink hover:bg-brand-soft cursor-pointer transition-colors"
                            >
                                {token}
                            </button>
                        ))}
                        <span className="ml-auto tabular-nums text-ink-4">{form.description.length}/300</span>
                    </div>
                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                    {preview && (
                        <p className="mt-2 rounded-lg bg-surface-sunken px-3 py-2 text-sm text-ink-2">
                            <span className="text-xs text-ink-3">Así saldrá en la próxima: </span>{preview}
                        </p>
                    )}
                </FormSection>

                <AditionalInformation
                    max={MAX_RECURRING_ADITIONALS}
                    hint="También admiten {mes}, {mm}, {año}, {periodo} y {fecha}."
                />
            </div>

            <aside className="w-full sm:max-w-sm sm:ml-auto xl:max-w-none xl:sticky xl:top-20">
                <RecurringSummary
                    frequency={form.frequency}
                    upcoming={upcoming}
                    autoSend={form.auto_send}
                    footer={
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white transition-colors cursor-pointer hover:bg-primaryhover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSaving && <FaSpinner className="animate-spin" aria-hidden="true" />}
                            {isSaving ? 'Guardando…' : recurring ? 'Guardar cambios' : 'Programar factura'}
                        </button>
                    }
                />
            </aside>
        </div>
    );
};
