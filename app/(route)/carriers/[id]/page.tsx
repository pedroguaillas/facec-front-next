import { Separate, Title } from "@/components";
import { CarrierFormProvider } from "../context/CarrierFormContext";
import { ButtonSubmit, CarrierForm } from "../shared";

interface PageProps {
    params: Promise<{ id: string }>;
}

const PageEditCarrier = async ({ params }: PageProps) => {

    const { id } = (await params);

    return (
        <CarrierFormProvider id={id}>
            <div className="dark:text-gray-300">
                <Title title="Transportista"
                    subTitle="Editar un transportista"
                />
                <div className="md:mx-8 py-4">
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                        <h1>
                            <span className="font-bold">Nota: </span>
                            Todos los campos marcados con * son obligatorios
                        </h1>
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

export default PageEditCarrier;
