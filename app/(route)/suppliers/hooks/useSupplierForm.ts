import { findSupplierByIdentification, storeSupplier, updateSupplier } from "@/services/supplierServices";
import { initialSupplier } from "@/constants/initialValues";
import { getSupplier } from "../services/suppliersServices";
import { supplierSchema } from "@/schemas/supplier.schema";
import { useParams, useRouter } from "next/navigation";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useEffect, useState } from "react";
import { Supplier } from "@/types";

export const useSupplierForm = () => {
    const [supplier, setSupplier] = useState<Supplier>(initialSupplier);
    type SupplierErrors = Partial<Record<keyof Supplier, string>>;
    const [errors, setErrors] = useState<SupplierErrors>({});
    const [skiFetch, setSkiFetch] = useState(false);
    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSupplier(prev => ({ ...prev, [name]: value }));

        if (name in errors) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    const handleSubmit = async (formData: FormData) => {
        const supplier = Object.fromEntries(
            Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        );

        const parsed = supplierSchema.safeParse(supplier);

        if (!parsed.success) {
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });
            setErrors(formatted);
            return;
        }

        if (params?.id !== undefined) {
            await updateSupplier(params.id + '', axiosAuth, supplier);
            router.push('/suppliers');
            return;
        }

        const res = await storeSupplier(axiosAuth, supplier);
        if (res) {
            router.push('/suppliers');
        }
    }

    useEffect(() => {
        const fetchGetSupplier = async () => {
            if (typeof params?.id === 'string') {
                const res = await getSupplier(params.id, axiosAuth);
                if (res !== null) {
                    setSkiFetch(true);
                    setSupplier({ ...res, id: res.id + '' });
                }
            }
        }

        fetchGetSupplier();
    }, [params?.id, axiosAuth]);

    useEffect(() => {
        const handleCustom = async () => {
            const res = await findSupplierByIdentification(axiosAuth, supplier.identication);
            if (res !== null) {
                if (res.branch_id !== 0) {
                    setErrors({ identication: 'El proveedor ya esta registrado' })
                    return;
                }
                const { name, address, email, phone } = res
                setSupplier(prev => ({
                    ...prev,
                    name, address, email, phone
                }));
            }
        }

        const identication = supplier.identication.trim();

        if (!skiFetch && ((supplier.type_identification === 'cédula' && identication.length === 10) || (supplier.type_identification === 'ruc' && identication.length === 13))) {
            handleCustom();
        }

    }, [supplier.type_identification, supplier.identication, skiFetch, axiosAuth])

    return { supplier, errors, handleChange, handleSubmit };
}