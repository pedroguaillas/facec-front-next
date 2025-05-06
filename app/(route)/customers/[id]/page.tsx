import { Separate, Title } from "@/components"
import { CustomerForm } from "../shared/CustomerForm"

const PageEditCustomer = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Cliente"
                subTitle="Editar un cliente"
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <h1>
                        <span className='font-bold'>Nota: </span>
                        Todos los campos marcado con * son obligatorios
                    </h1>
                    <Separate />
                    <CustomerForm />
                </div>
            </div>
        </div>
    )
}
export default PageEditCustomer;
