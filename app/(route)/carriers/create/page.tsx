import { CarrierFormProvider } from "../context/CarrierFormContext";
import { ButtonSubmit, CarrierForm } from "../shared";
import { RequiredFields, Separate, Title } from "@/components";

const PageCreateCarrier = () => {
    return (
        <CarrierFormProvider>
            <div className="dark:text-gray-300">
                <Title
                    title="Transportistas"
                    subTitle="Registrar un nuevo transportista"
                />
                <div className='md:mx-8 py-4'>
                    {/* Card */}
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                        <RequiredFields />
                        <Separate />
                        <CarrierForm />
                        <Separate />
                        <ButtonSubmit />
                    </div>
                </div>
            </div>
        </CarrierFormProvider>
    )
}

export default PageCreateCarrier;
