import { GeneralInformation, ListProducts, RetentionInformation, ListTaxes, Totals } from "./components";
import { ShopCreateProvider } from "./context/ShopCreateContext";
import { Separate, Title } from "@/components";

const PageCreateShop = () => {
    return (
        <ShopCreateProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Documento"
                    subTitle="Registrar un nuevo documento"
                />

                <div className='md:mx-8 py-4'>

                    {/* Card */}
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                        <h2>
                            <span className="font-bold">Nota: </span>
                            Los campos marcados con * son obligatorios
                        </h2>
                        <Separate />
                        <GeneralInformation />
                        <ListProducts />
                        <Separate />
                        <RetentionInformation />
                        <Separate />
                        <ListTaxes />
                        <Separate />
                        <Totals />
                    </div>
                </div>

            </div>
        </ShopCreateProvider>
    )
}
export default PageCreateShop;
