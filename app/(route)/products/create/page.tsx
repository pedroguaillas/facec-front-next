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
                />
                <div className='md:mx-8 py-4'>
                    {/* Card */}
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
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