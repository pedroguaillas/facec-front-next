"use client";

import { storeCustomer, updateCustomer } from '@/services/customerServices';
import { customerSchema } from '@/schemas/customer.schema';
import { useCustomerForm } from '../hooks/useCustomerForm';
import { SelectOption, TextInput } from '@/components';
import { useParams, useRouter } from 'next/navigation';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { ButtonSubmit } from './ButtonSubmit';
import { useActionState } from 'react';

export const CustomerForm = () => {

    const router = useRouter();
    const axiosAuth = useAxiosAuth();
    const { customer, errors, handleChange, setErrors } = useCustomerForm();
    const params = useParams();

    const [, formAction] = useActionState(
        async (prevState: unknown, queryData: FormData) => {

            const customer = Object.fromEntries(
                Array.from(queryData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            );

            const parsed = customerSchema.safeParse(customer);

            if (!parsed.success) {
                console.log('errores', parsed.error)
                const formatted: Record<string, string> = {};
                parsed.error.errors.forEach(err => {
                    formatted[err.path[0] as string] = err.message;
                });
                setErrors(formatted);
                return;
            }

            // TODO: falta que regrese una respuesta un Customer o Error por no poder guardar.
            if (params?.id !== undefined) {
                await updateCustomer(params.id + '', axiosAuth, customer);
                router.push('/customers');
                return;
            }

            const res = await storeCustomer(axiosAuth, customer);
            console.log(res)
            router.push('/customers');
        }, null
    );

    const optionType = [
        { label: 'Cédula', value: 'cédula' },
        { label: 'RUC', value: 'ruc' },
    ]

    return (
        <form action={formAction}>
            <strong className='font-bold'>Datos generales</strong>

            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Tipo de identificación" name='type_identification' options={optionType} selectedValue={customer.type_identification} handleSelect={handleChange} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Identificación *' value={customer.identication} error={errors.identication} onChange={handleChange} name='identication' maxLength={customer.type_identification === 'cédula' ? 10 : 13} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Nombre *' value={customer.name} error={errors.name} onChange={handleChange} name='name' maxLength={300} />
                    </div>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Dirección' value={customer.address ?? ''} error={errors.address} onChange={handleChange} name='address' maxLength={300} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='text' label='Teléfono' value={customer.phone ?? ''} error={errors.phone} onChange={handleChange} name='phone' maxLength={20} />
                    </div>
                    <div className='lg:w-2/3'>
                        <TextInput type='email' label='Correo' value={customer.email ?? ''} error={errors.email} onChange={handleChange} name='email' maxLength={50} />
                    </div>
                </div>
            </div>

            <ButtonSubmit />
        </form>
    )
}
