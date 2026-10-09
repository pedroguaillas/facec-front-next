import { CompaniesFormProvider } from '../context/CompaniesFormContext';
import { RequiredFields, Separate, Title } from '@/components';
import PermissionFormCompany from '../shared/PermissionFormCompany';

interface PageProps {
    params: Promise<{ id: string }>;
}

const CompanyEdit = async ({ params }: PageProps) => {

    const { id } = (await params)

    return (
        <CompaniesFormProvider id={id}>
            <div className="dark:text-gray-300">
                <Title
                    title="Contribuyentes"
                    subTitle="Editar un contribuyente"
                    actions={[{ label: "Regresar", type: "link", url: "/admin/companies", action: "back" }]}
                />
                <div className="md:mx-8 py-4">
                    <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                        <RequiredFields />
                        <Separate />
                        <PermissionFormCompany />
                    </div>
                </div>
            </div>
        </CompaniesFormProvider>
    )
}

export default CompanyEdit;