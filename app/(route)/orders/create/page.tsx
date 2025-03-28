import { InvoiceCreateProvider } from '../context/InvoiceCreateContext';
import { GeneralInformation } from './components/GeneralInformation';
import { TitleForm } from './components/TitleForm';
import { Title } from '@/components';
import React from 'react'

const CreateOrderPage = () => {
  return (
    <InvoiceCreateProvider>
      <div className="dark:text-gray-300">

        <Title
          title="Documento"
          subTitle="Registrar un nuevo documento"
        />

        <div className='md:mx-8 py-4'>

          {/* Card */}
          <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 mt-4 shadow-2xl">
            <TitleForm />
            <GeneralInformation />
          </div>
        </div>

      </div>
    </InvoiceCreateProvider>
  )
};

export default CreateOrderPage;