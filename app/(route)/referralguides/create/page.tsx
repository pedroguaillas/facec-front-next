import { FormReferralGuideProvider } from '../context/FormReferralGuideContext';
import { GeneralInformation, ListProducts, ButtonSubmit } from '../shared';
import { Title } from '@/components';

const PageCreateReferralGuide = () => {
	return (
		<FormReferralGuideProvider>
			<div className='dark:text-gray-300'>
				<Title
					title='Guía de remisión'
					subTitle='Registrar una nueva guía de remisión'
					actions={[{ label: 'Regresar', type: 'link', url: '/referralguides', action: 'back' }]}
				/>

				<div className='md:mx-8 py-4 mt-4'>
					<div className='max-w-5xl rounded-xl border border-line bg-surface p-4 lg:p-6'>
						<GeneralInformation />
						<ListProducts />
						<ButtonSubmit />
					</div>
				</div>
			</div>
		</FormReferralGuideProvider>
	);
};

export default PageCreateReferralGuide;
