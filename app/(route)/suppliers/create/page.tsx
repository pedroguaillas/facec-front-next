import { Separate, Title } from "@/components";
import { SupplierForm } from "../shared/SupplierForm";

const PageCreateSupplier = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Proveedores"
                subTitle="Registrar un nuevo proveedor"
            />
            <div className='md:mx-8 py-4'>
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <h1>
                        <span className='font-bold'>Nota: </span>
                        Todos los campos marcado con * son obligatorios
                    </h1>
                    <Separate />
                    <SupplierForm />
                </div>
            </div>
        </div>
    )
}

export default PageCreateSupplier;
