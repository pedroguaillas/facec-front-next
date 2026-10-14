'use client';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { LabelComponent, SelectCarrier, SelectCustomer, SelectOption, TextInput } from '@/components';
import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { useGeneralInformation } from '../hooks/useGeneralInformation';
import { useSelectPoint } from '../hooks/useSelectPoint';
import { FormSection } from '../../orders/shared/FormSection';
import { addDaysToDate, formatDate, getDate, getMinDate } from '@/helpers/dateHelper';
import { GUIDE_DURATION_MAX_DAYS, GUIDE_START_MAX_DAYS } from '@/constants/referralGuides';

// Días entre dos fechas YYYY-MM-DD, contando ambos extremos
const spanDays = (from: string, to: string) => {
	const [y1, m1, d1] = from.split('-').map(Number);
	const [y2, m2, d2] = to.split('-').map(Number);
	return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000) + 1;
};

export const GeneralInformation = () => {
	const { optionPoints, handleChange, handleSelectPoint, handleSelectCustomer, handleSelectCarrier } = useGeneralInformation();
	const { points, referralGuide, selectPoint, selectCarrier, selectCustom, errors } = useFormReferralGuide();
	// Sustento y datos opcionales plegados, salvo que ya tengan algo
	const [showSupport, setShowSupport] = useState(false);
	const [showExtra, setShowExtra] = useState(false);
	const supportOpen = showSupport || !!(referralGuide.serie_invoice || referralGuide.date_invoice || referralGuide.authorization_invoice || errors.serie_invoice || errors.date_invoice || errors.authorization_invoice);
	const extraOpen = showExtra || !!(referralGuide.route || referralGuide.branch_destiny || referralGuide.customs_doc || errors.route || errors.branch_destiny || errors.customs_doc);

	useSelectPoint();

	const today = getDate();
	const { date_start, date_end } = referralGuide;
	const validRange = !!date_start && !!date_end && date_end >= date_start;
	const days = validRange ? spanDays(date_start, date_end) : 0;
	const hasSerie = /^\d{3}-\d{3}-\d{9}$/.test(referralGuide.serie);

	return (
		<>
			<FormSection
				title='Comprobante'
				aside={hasSerie ? <span className='text-xs text-ink-3'>N.º <span className='font-mono tabular-nums text-ink-1'>{referralGuide.serie}</span></span> : undefined}
			>
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6'>
					{points.length > 1 && (
						<SelectOption label='Punto de emisión' name='emision_point_id' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ''} error={errors.serie} handleSelect={handleSelectPoint} required />
					)}
					{points.length === 0 && !hasSerie && (
						<p className='sm:col-span-2 text-sm text-ink-3'>{errors.serie ?? referralGuide.serie}</p>
					)}
					<div className='flex flex-col gap-1.5 my-2'>
						<LabelComponent name='carrier_id' label='Transportista' required />
						<SelectCarrier label={selectCarrier?.atts.name} error={errors.carrier_id} selectCarrier={handleSelectCarrier} />
					</div>
					<div className='flex flex-col gap-1.5 my-2'>
						<LabelComponent name='customer_id' label='Destinatario' required />
						<SelectCustomer label={selectCustom?.atts.name} error={errors.customer_id} optionCreate={false} selectCustomer={handleSelectCustomer} />
					</div>
				</div>
			</FormSection>

			<FormSection
				title='Traslado'
				aside={validRange ? (
					<span className='text-xs text-ink-3 tabular-nums'>
						{formatDate(date_start)}{days > 1 && <> → {formatDate(date_end)}</>} · <span className='font-medium text-ink-1'>{days} {days === 1 ? 'día' : 'días'}</span>
					</span>
				) : undefined}
			>
				{/* Ruta: de dónde sale y a dónde llega */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6'>
					<TextInput label='Dirección de partida' value={referralGuide.address_from} error={errors.address_from} onChange={handleChange} name='address_from' maxLength={300} required />
					<TextInput
						label='Dirección de destino'
						value={referralGuide.address_to}
						error={errors.address_to}
						onChange={handleChange}
						name='address_to'
						maxLength={300}
						hint={!referralGuide.address_to && !selectCustom ? 'Se llena con la dirección del destinatario' : undefined}
						required
					/>
					<TextInput
						type='date'
						label='Fecha de inicio'
						value={date_start}
						error={errors.date_start}
						onChange={handleChange}
						name='date_start'
						min={today}
						max={addDaysToDate(today, GUIDE_START_MAX_DAYS)}
						hint={`Desde hoy hasta ${GUIDE_START_MAX_DAYS} días después`}
						required
					/>
					<TextInput
						type='date'
						label='Fecha de fin'
						value={date_end}
						error={errors.date_end}
						onChange={handleChange}
						name='date_end'
						min={date_start || today}
						max={addDaysToDate(date_start || today, GUIDE_DURATION_MAX_DAYS)}
						hint={`Hasta ${GUIDE_DURATION_MAX_DAYS} días después del inicio`}
						required
					/>
					<div className='sm:col-span-2'>
						<TextInput label='Motivo del traslado' value={referralGuide.reason_transfer} error={errors.reason_transfer} onChange={handleChange} name='reason_transfer' maxLength={300} placeholder='Ej. Venta, traslado entre locales, devolución' required />
					</div>
				</div>

				<Disclosure open={extraOpen} onToggle={() => setShowExtra(!extraOpen)} label='Ruta, establecimiento destino y documento aduanero'>
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-x-6'>
						<TextInput label='Ruta' value={referralGuide.route ?? ''} error={errors.route} onChange={handleChange} name='route' maxLength={300} placeholder='Ej. Riobamba - Quito' />
						<TextInput label='Establecimiento destino' value={referralGuide.branch_destiny ?? ''} error={errors.branch_destiny} onChange={handleChange} name='branch_destiny' maxLength={3} inputMode='numeric' placeholder='001' />
						<TextInput label='Documento aduanero' value={referralGuide.customs_doc ?? ''} error={errors.customs_doc} onChange={handleChange} name='customs_doc' maxLength={17} />
					</div>
				</Disclosure>

				<Disclosure open={supportOpen} onToggle={() => setShowSupport(!supportOpen)} label='Factura de sustento del traslado'>
					<div className='grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)] gap-x-6'>
						<TextInput label='Serie' value={referralGuide.serie_invoice ?? ''} error={errors.serie_invoice} onChange={handleChange} name='serie_invoice' maxLength={17} placeholder='001-001-000000001' />
						<TextInput type='date' label='Fecha de autorización' value={referralGuide.date_invoice ?? ''} error={errors.date_invoice} onChange={handleChange} name='date_invoice' max={getMinDate()} />
						<TextInput label='Autorización' value={referralGuide.authorization_invoice ?? ''} error={errors.authorization_invoice} onChange={handleChange} name='authorization_invoice' maxLength={49} inputMode='numeric' />
					</div>
				</Disclosure>
			</FormSection>
		</>
	);
};

// Bloque plegable para campos opcionales
const Disclosure = ({ open, onToggle, label, children }: { open: boolean; onToggle: () => void; label: string; children: React.ReactNode }) => (
	<div className='mt-1'>
		<button type='button' onClick={onToggle} aria-expanded={open} className='inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-brand-ink cursor-pointer'>
			<FaChevronDown aria-hidden='true' className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`} />
			{label}
		</button>
		{open && <div className='mt-1'>{children}</div>}
	</div>
);
