import { RequiredFields, Separate, Title } from "@/components";
import { FormShopProvider } from "../context/FormShopContext";
import { GeneralInformation, ListProducts, ListTaxes, PaymentInformation, RetentionInformation, Totals } from "../shared";

const PageShopEdit = () => {
    return (
        <FormShopProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Documento"
                    subTitle="Editar un documento"
                    actions={[{ label: "Regresar", type: "link", url: "/shops", action: "back" }]}
                />

                <div className="md:mx-8 py-4">

                    {/* Card */}
                    <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                        <RequiredFields />
                        <Separate />
                        <GeneralInformation />
                        <PaymentInformation />
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
