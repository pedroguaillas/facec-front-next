import { Title } from '@/components';
import { Tabs } from '../components/Tabs';
import { PermissionsForm } from './components/PermissionsForm';

const PagePermissions = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Configuraciones"
                subTitle="Configuraciones del sistema"
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <Tabs activeTab='permisos' />
                    <PermissionsForm />
                </div>
            </div>
        </div>
    )
}

export default PagePermissions;
