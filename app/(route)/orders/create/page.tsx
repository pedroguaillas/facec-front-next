import { AditionalInformation, GeneralInformation, ListProducts, PayMethods, TitleForm, Totales } from './components';
import { InvoiceCreateProvider } from '../context/InvoiceCreateContext';
import { Separate, Title } from '@/components';

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
          <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
            <TitleForm title='Nota:' description='Los campos marcados con * son obligatorios' />
            <Separate />
            <GeneralInformation />
            <Separate />
            <ListProducts />
            <Separate />
            <div className='flex flex-col sm:flex-row justify-between pt-2 gap-2'>
              <div className='mb-2'>
                <PayMethods />
                <AditionalInformation />
              </div>
              <Totales />
            </div>
          </div>
        </div>

      </div>
    </InvoiceCreateProvider>
  )
};

export default CreateOrderPage;