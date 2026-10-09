import { Title } from '@/components';
import React from 'react'
import { Tabs } from '../components/Tabs';
import { BranchesList } from './components/BranchesList';

const PageBranches = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Establecimientos"
                subTitle='Lista de establecimientos'
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <Tabs activeTab='establecimientos' />
                    <BranchesList />
                </div>
            </div>
        </div>
    )
}

export default PageBranches;