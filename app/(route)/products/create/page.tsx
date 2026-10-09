import { ProductFormProvider } from '../context/ProductFormContext';
import { ProductForm, ButtonSubmit } from '../shared';
import { RequiredFields, Separate, Title } from '@/components';

const pageCreateProduct = () => {
    return (
        <ProductFormProvider>
            <div className="dark:text-gray-300">
                <Title
                    title="Producto"
                    subTitle="Registrar un nuevo producto"
                    actions={[{ label: "Regresar", type: "link", url: "/products", action: "back" }]}
                />
                <div className='md:mx-8 py-4'>
                    {/* Card */}
                    <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                        <RequiredFields />
                        <Separate />
                        <ProductForm />
                        <Separate />
                        <ButtonSubmit />
                    </div>
                </div>
            </div>
        </ProductFormProvider>
    )
}

export default pageCreateProduct;