import { Separate, Title } from "@/components";
import { FormShopProvider } from "../context/FormShopContext";
import { GeneralInformation, ListProducts, ListTaxes, RetentionInformation, Totals } from "../shared";

const PageShopEdit = () => {
    return (
        <FormShopProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Documento"
                    subTitle="Editar un documento"
                />

                <div className="md:mx-8 py-4">

                    {/* Card */}
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                        <h2>
                            <span className="font-bold">Nota: </span>
                        </h2>
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

export default PageShopEdit;
