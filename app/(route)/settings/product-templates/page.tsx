import { Title } from '@/components';
import { Tabs } from '../components/Tabs';
import { ProductTemplatesList } from './components/ProductTemplatesList';

const PageProductTemplates = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Configuraciones"
                subTitle="Características de productos"
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <Tabs activeTab='caracteristicas' />
                    <ProductTemplatesList />
                </div>
            </div>
        </div>
    )
}

export default PageProductTemplates;
