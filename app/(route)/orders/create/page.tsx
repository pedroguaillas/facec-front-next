import { AditionalInformation, GeneralInformation, ListProducts, PaymentSection, Repayments, Totals } from '../shared';
import { FormInvoiceProvider } from '../context/FormInvoiceContext';
import { Title } from '@/components';

const CreateOrderPage = () => {
  return (
    <FormInvoiceProvider>
      <div className="dark:text-gray-300">

        <Title
          title="Documento"
          subTitle="Registrar un nuevo documento"
          actions={[{ label: "Regresar", type: "link", url: "/orders", action: "back" }]}
        />

        {/* Formulario + resumen tipo recibo (fijo al costado en pantallas grandes) */}
        <div className='md:mx-8 py-4 mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] items-start'>
          <div className="min-w-0 rounded-xl border border-line bg-surface p-4 lg:p-6">
            <GeneralInformation />
            <ListProducts />
            <Repayments />
            <PaymentSection />
            <AditionalInformation />
          </div>
          <aside className="w-full sm:max-w-sm sm:ml-auto xl:max-w-none xl:sticky xl:top-20">
            <Totals />
          </aside>
        </div>

      </div>
    </FormInvoiceProvider>
  )
};

export default CreateOrderPage;
