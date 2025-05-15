'use client';

import { SelectCarrier, SelectCustomer, SelectOption, Separate, TextInput } from '@/components';
import { useReferralGuide } from '../context/ReferralGuideCreateContext';
import { useGeneralInformation } from '../hooks/useGeneralInformation';
import { useSelectPoint } from '../hooks/useSelectPoint';
import { getMinDate } from '@/helpers/dateHelper';

export const GeneralInformation = () => {
	const { points, referralGuide, selectPoint, errors } = useReferralGuide();
	const { optionPoints, handleChange, handleSelectPoint, handleSelectCustomer, handleSelectCarrier } = useGeneralInformation();

	useSelectPoint();

	return (
		<>
			<div className='py-2'>
				<strong className='font-bold'>Datos generales</strong>

				{/* Row */}
				<div className='sm:flex gap-4'>
					{/* Col 1 */}
					<div className='w-full'>
						{/* !Todo: Check handleSelect function */}
						{points.length > 1 && (
							<div className='flex flex-col lg:w-2/3'>
								<SelectOption label='Punto Emisión' name='emision_point_id' options={optionPoints} select={true} selectedValue={selectPoint?.id ?? ''} error={errors.serie} handleSelect={handleSelectPoint} />
							</div>
						)}
						<div className='py-2'>
							<span>N° de serie </span>
							{referralGuide.serie}
						</div>
						<div className='flex flex-col lg:w-2/3'>
							<span>Transportista</span>
							<SelectCarrier error={errors.carrier_id} selectCarrier={handleSelectCarrier} />
						</div>
						<div className='flex flex-col lg:w-2/3 pt-2'>
							<span>Destinatario/Cliente</span>
							<SelectCustomer error={errors.customer_id} optionCreate={false} selectCustomer={handleSelectCustomer} />
						</div>
						<div className='lg:w-2/3'>
							<TextInput type='text' label='Dirección partida *' value={referralGuide.address_from} error={errors.address_from} onChange={handleChange} name='address_from' maxLength={300} />
						</div>
						<div className='lg:w-2/3'>
							<TextInput type='text' label='Dirección destino *' value={referralGuide.address_to} error={errors.address_to} onChange={handleChange} name='address_to' maxLength={300} />
						</div>
					</div>

					{/* Col 2 */}
					<div className='w-full'>
						<div className='lg:w-2/3'>
							<TextInput type='date' label='Fecha inicio *' value={referralGuide.date_start} error={errors.date_start} onChange={handleChange} name='date_start' />
						</div>
						<div className='lg:w-2/3'>
							<TextInput type='date' label='Fecha fin *' value={referralGuide.date_end} error={errors.date_end} onChange={handleChange} name='date_end' />
						</div>
						<div className='lg:w-2/3'>
							<TextInput type='text' label='Motivo translado *' value={referralGuide.reason_transfer} error={errors.reason_transfer} onChange={handleChange} name='reason_transfer' maxLength={300} />
						</div>
						<div className='lg:w-2/3'>
							<TextInput type='text' label='Cod estable destino' value={referralGuide.branch_destiny ?? ''} error={errors.branch_destiny} onChange={handleChange} name='branch_destiny' maxLength={3} />
						</div>
						<div className='lg:w-2/3'>
							<TextInput type='text' label='Documento aduanero' value={referralGuide.customs_doc ?? ''} error={errors.customs_doc} onChange={handleChange} name='customs_doc' maxLength={17} />
						</div>
						<div className='lg:w-2/3'>
							<TextInput type='text' label='Ruta' value={referralGuide.route ?? ''} error={errors.route} onChange={handleChange} name='route' maxLength={300} />
						</div>
					</div>
				</div>
			</div>

			<Separate />

			<div className='py-2'>
				<strong className='font-bold'>Comprobante sustento</strong>

				{/* Row */}
				<div className='sm:flex gap-4'>
					{/* Col 1 */}
					<div className='w-full'>
						<TextInput type='text' label='Serie' value={referralGuide.serie_invoice ?? ''} error={errors.serie_invoice} onChange={handleChange} name='serie_invoice' maxLength={17} />
					</div>
					{/* Col 2 */}
					<div className='w-full'>
						<TextInput type='date' label='Fecha de autorización' value={referralGuide.date_invoice ?? ''} error={errors.date_invoice} onChange={handleChange} name='date_invoice' max={getMinDate()} />
					</div>
					{/* Col 3 */}
					<div className='w-full'>
						<TextInput type='text' label='Autorización' value={referralGuide.authorization_invoice ?? ''} error={errors.authorization_invoice} onChange={handleChange} name='authorization_invoice' maxLength={49} />
					</div>
				</div>
			</div>
		</>
	);
};
