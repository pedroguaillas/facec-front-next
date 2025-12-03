import { AditionalInformation, GeneralInformation, ListProducts, PayMethods, Totals } from "../shared";
import { FormInvoiceProvider } from "../context/FormInvoiceContext";
import { Separate, Title, RequiredFields } from "@/components";

const EditOrderPage = () => {
    return (
        <FormInvoiceProvider>

            <div className="dark:text-gray-300">

                <Title
                    title="Documento"
                    subTitle="Editar documento"
                />

                <div className="md:mx-8 py-4">

                    {/* Card */}
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                        <RequiredFields />
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
                            <Totals />
                        </div>
                    </div>
                </div>
            </div>
        </FormInvoiceProvider>
    )
}

export default EditOrderPage;
