import { Title } from "@/components";
import { FormShopProvider } from "../context/FormShopContext";
import { GeneralInformation, ListProducts, PaymentInformation, RetentionInformation, Totals } from "../shared";

const PageShopEdit = () => {
    return (
        <FormShopProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Compra"
                    subTitle="Editar compra"
                    actions={[{ label: "Regresar", type: "link", url: "/shops", action: "back" }]}
                />

                {/* Formulario + resumen tipo recibo (fijo al costado en pantallas grandes) */}
                <div className="md:mx-8 py-4 mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] items-start">
                    <div className="min-w-0 rounded-xl border border-line bg-surface p-4 lg:p-6">
                        <GeneralInformation />
                        <ListProducts />
                        <PaymentInformation />
                        <RetentionInformation />
                    </div>
                    <aside className="w-full sm:max-w-sm sm:ml-auto xl:max-w-none xl:sticky xl:top-20">
                        <Totals />
                    </aside>
                </div>
            </div>
        </FormShopProvider>
    )
}

export default PageShopEdit;
