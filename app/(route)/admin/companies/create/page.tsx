import { RequiredFields, Separate, Title } from "@/components";
import { RucForm } from "../shared/RucForm";

const PageCreateCompany = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Contribuyentes"
                subTitle="Registrar un nuevo contribuyente"
                actions={[{ label: "Regresar", type: "link", url: "/admin/companies", action: "back" }]}
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <RequiredFields />
                    <Separate />
                    <RucForm />
                </div>
            </div>
        </div>
    )
}

export default PageCreateCompany;
