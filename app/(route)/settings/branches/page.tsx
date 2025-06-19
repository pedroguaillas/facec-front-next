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
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <Tabs activeTab='establecimientos' />
                    <BranchesList />
                </div>
            </div>
        </div>
    )
}

export default PageBranches;