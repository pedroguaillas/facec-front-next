import { FormReferralGuideProvider } from '../context/FormReferralGuideContext';
import { GeneralInformation, ListProducts, ButtonSubmit } from '../shared';
import { Separate, Title } from '@/components';

const PageCreateReferralGuide = () => {
	return (
		<FormReferralGuideProvider>
			<div className='dark:text-gray-300'>
				<Title title='Guia de remisión' subTitle='Registrar un nuevo guia de remisión' />

				<div className='md:mx-8 py-4'>
					{/* Card */}
					<div className='w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl'>
						<h2>
							<span className='font-bold'>Nota: </span>
							Los campos marcados con * son obligatorios
						</h2>
						<Separate />
						<GeneralInformation />
						<Separate />
						<ListProducts />
						<Separate />
						<ButtonSubmit />
					</div>
				</div>
			</div>
		</FormReferralGuideProvider>
	);
};

export default PageCreateReferralGuide;
