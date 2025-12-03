import { GeneralInformation, ListProducts, RetentionInformation, ListTaxes, Totals } from "../shared";
import { FormShopProvider } from "../context/FormShopContext";
import { RequiredFields, Separate, Title } from "@/components";

const PageCreateShop = () => {
    return (
        <FormShopProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Documento"
                    subTitle="Registrar un nuevo documento"
                />

                <div className='md:mx-8 py-4'>

                    {/* Card */}
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                        <RequiredFields />
                        <Separate />
                        <GeneralInformation />
                        <ListProducts />
                        <Separate />
                        <RetentionInformation />
                        <ListTaxes />
                        <Separate />
                        <Totals />
                    </div>
                </div>

            </div>
        </FormShopProvider>
    )
}
export default PageCreateShop;
