import { FormReferralGuideProvider } from '../context/FormReferralGuideContext';
import { GeneralInformation, ListProducts, ButtonSubmit } from '../shared';
import { RequiredFields, Separate, Title } from '@/components';

const PageCreateReferralGuide = () => {
	return (
		<FormReferralGuideProvider>
			<div className='dark:text-gray-300'>
				<Title title='Guia de remisión' subTitle='Registrar un nuevo guia de remisión' />

				<div className='md:mx-8 py-4'>
					{/* Card */}
					<div className='w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4'>
						<RequiredFields />
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
