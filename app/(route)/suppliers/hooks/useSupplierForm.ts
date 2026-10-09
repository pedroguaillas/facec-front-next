import { resolveSupplier, storeSupplier, updateSupplier } from "@/services/supplierServices";
import { initialSupplier } from "@/constants/initialValues";
import { supplierSchema } from "@/schemas/supplier.schema";
import { getSupplier } from "../services/suppliersServices";
import { usePartyForm } from "@/lib/hooks/usePartyForm";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Supplier } from "@/types";

export const useSupplierForm = (id: string | undefined, onSaved: () => void) => {
    const axiosAuth = useAxiosAuth();

    return usePartyForm<Supplier>({
        id,
        initial: initialSupplier,
        schema: supplierSchema,
        fetch: (supplierId) => getSupplier(supplierId, axiosAuth),
        save: (form, supplierId) => supplierId
            ? updateSupplier(supplierId, axiosAuth, form)
            : storeSupplier(axiosAuth, form),
        resolve: (identication) => resolveSupplier(axiosAuth, identication),
        fillFields: ['name', 'address', 'phone', 'email'],
        duplicateMessage: 'El proveedor ya está registrado',
        onSaved,
    });
}
