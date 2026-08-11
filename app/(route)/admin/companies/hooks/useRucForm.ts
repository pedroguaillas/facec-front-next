import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { companySchema } from '@/schemas/company.schema';
import { findCompanyByRuc } from '@/services/sriServices';
import { checkUserAvailability } from '@/services/adminUserServices';
import { ChangeEvent, useActionState, useEffect, useState } from 'react';
import { storeCompany } from '../services/companiesServices';
import { useRouter } from 'next/navigation';

interface initialRuc {
    ruc: string,
    company: string,
    regimen: number,
    user: string,
    password: string,
    email: string,
}

export const useRucForm = () => {

    const [ruc, setRuc] = useState<initialRuc>({
        ruc: '',
        company: '',
        regimen: 0,
        user: '',
        password: '',
        email: '',
    });

    const axiosAuth = useAxiosAuth();
    const router = useRouter();

    const [errors, setErrors] = useState<Partial<Record<keyof initialRuc, string>>>({});
    const [success, setSuccess] = useState<Partial<Record<keyof initialRuc, string>>>({});

    const optionType = [
        { value: 0, label: 'GENERAL' },
        { value: 1, label: 'RIMPE EMPRENDEDOR' },
        { value: 2, label: 'RIMPE NEGOCIO POPULAR' },
    ]

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setRuc(prev => ({
            ...prev,
            [name]: name === 'regimen' ? Number(value) : value
        }));

        setErrors(prev => ({ ...prev, [name]: '' }));
        setSuccess(prev => ({ ...prev, [name]: '' }));
    };

    const [, formAction] = useActionState(
        async (prevState: unknown, queryData: FormData) => {

            const customer = Object.fromEntries(
                Array.from(queryData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            );

            const parsed = companySchema.safeParse(customer);

            if (!parsed.success) {
                console.log('errores', parsed.error)
                const formatted: Record<string, string> = {};
                parsed.error.errors.forEach(err => {
                    formatted[err.path[0] as string] = err.message;
                });
                setErrors(formatted);
                return;
            }

            const res = await storeCompany(axiosAuth, parsed.data);
            console.log(res)
            router.push('/admin/companies');
        }, null
    );

    useEffect(() => {
        const handleCustom = async () => {
            const { data } = await findCompanyByRuc(axiosAuth, ruc.ruc);
            if (data) {
                if (data.registered) {
                    setErrors(prev => ({ ...prev, ruc: 'Este RUC ya está registrado' }));
                    setSuccess(prev => ({ ...prev, ruc: '' }));
                    return;
                }

                setErrors(prev => ({ ...prev, ruc: '' }));
                setSuccess(prev => ({ ...prev, ruc: 'RUC encontrado en el SRI' }));
                setRuc(prev => ({
                    ...prev,
                    company: data.name,
                }));
            }
        }

        const identication = ruc.ruc.trim();

        if (identication.length === 13) {
            handleCustom();
        }

    }, [ruc.ruc, axiosAuth])

    useEffect(() => {
        const user = ruc.user.trim();
        if (user.length < 3) return;

        const timeout = setTimeout(async () => {
            const { data } = await checkUserAvailability(axiosAuth, { user });
            if (data) {
                if (data.user.registered) {
                    setErrors(prev => ({ ...prev, user: 'Este usuario ya está registrado' }));
                    setSuccess(prev => ({ ...prev, user: '' }));
                } else {
                    setErrors(prev => ({ ...prev, user: '' }));
                    setSuccess(prev => ({ ...prev, user: 'Usuario disponible' }));
                }
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [ruc.user, axiosAuth])

    useEffect(() => {
        const email = ruc.email.trim();
        if (!/^\S+@\S+\.\S+$/.test(email)) return;

        const timeout = setTimeout(async () => {
            const { data } = await checkUserAvailability(axiosAuth, { email });
            if (data) {
                if (!data.email.valid) {
                    setErrors(prev => ({ ...prev, email: 'Correo inválido' }));
                    setSuccess(prev => ({ ...prev, email: '' }));
                } else if (data.email.registered) {
                    setErrors(prev => ({ ...prev, email: 'Este correo ya está registrado' }));
                    setSuccess(prev => ({ ...prev, email: '' }));
                } else {
                    setErrors(prev => ({ ...prev, email: '' }));
                    setSuccess(prev => ({ ...prev, email: 'Correo disponible' }));
                }
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [ruc.email, axiosAuth])

    return {
        ruc,
        errors,
        success,
        optionType,
        handleChange,
        formAction,
    }
}
