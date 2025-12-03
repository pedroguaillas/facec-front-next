import { CustomerForm } from '../shared/CustomerForm';
import { RequiredFields, Separate, Title } from '@/components';

const PageCreateCustomer = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Cliente"
                subTitle="Registrar un nuevo cliente"
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <RequiredFields />
                    <Separate />
                    <CustomerForm />
                </div>
            </div>
        </div>
    )
}

export default PageCreateCustomer;