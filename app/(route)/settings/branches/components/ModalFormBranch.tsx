import { IconButton, Modal, PrimaryButton, Switch, TextInput } from "@/components"
import { initialBranch } from "@/constants";
import { handleApiRequest } from "@/helpers/apiHandler";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Branch } from "@/types";
import { ChangeEvent, useState } from "react";

interface Props {
    fetchGetBraches: () => void;
    editBranch?: Branch;
    isFirstBranch?: boolean;
}

export const ModalFormBranch = ({ fetchGetBraches, editBranch, isFirstBranch }: Props) => {

    const isEdit = !!editBranch;

    const [isOpen, setIsOpen] = useState(false);
    const [branch, setBranch] = useState<Branch>(editBranch ?? initialBranch);
    const [errors, setErrors] = useState<Partial<Record<keyof Branch, string>>>({});
    const axiosAuth = useAxiosAuth();

    const toggle = () => {
        if (!isOpen) {
            setBranch(editBranch ?? initialBranch);
            setErrors({});
        }
        setIsOpen(prevState => !prevState);
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setBranch(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    }

    const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setBranch(prev => ({ ...prev, [name]: checked }))
    }

    const handleTypeSwitch = (e: ChangeEvent<HTMLInputElement>) => {
        setBranch(prev => ({ ...prev, type: e.target.checked ? 'matriz' : 'sucursal' }));
    }

    const store = async () => {
        const { errors: apiErrors } = isEdit
            ? await handleApiRequest(() => axiosAuth.put(`branches/${branch.id}`, branch))
            : await handleApiRequest(() => axiosAuth.post('branches', branch));

        if (apiErrors) {
            setErrors(apiErrors);
            return;
        }

        toggle()
        fetchGetBraches()
    }

    return (
        <>
            {isEdit ? (
                <IconButton type="button" action="edit" onClick={toggle} title="Editar" />
            ) : (
                <div className='flex justify-end pt-4'>
                    <div>
                        <PrimaryButton label='Agregar' type='button' action='add' onClick={toggle} />
                    </div>
                </div>
            )}

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title={isEdit ? "Editar establecimiento" : "Registrar establecimiento"}
                modalSize="sm"
            >
                <TextInput type='text' label='Establecimiento' value={branch.store + ''} error={errors.store} onChange={handleChange} name='store' maxLength={3} required/>
                <TextInput type='text' label='Dirección' value={branch.address} error={errors.address} onChange={handleChange} name='address' maxLength={300} required/>
                <TextInput type='text' label='Nombre ' value={branch.name ?? ''} error={errors.name} onChange={handleChange} name='name' maxLength={300} />

                <Switch name="type" label="Es Matriz" checked={branch.type === 'matriz'} disabled={branch.type === 'matriz'} onChange={handleTypeSwitch} />

                {!isEdit && isFirstBranch && (
                    <label className=" inline-flex gap-2 mt-2">
                        <input type="checkbox" checked={!!branch.cf} onChange={handleCheckbox} name="cf" />
                        Crear consumidor final?
                    </label>
                )}

                <div className='flex justify-end py-2'>
                    <div>
                        <PrimaryButton label='Guardar' type='button' action='store' onClick={store} />
                    </div>
                </div>
            </Modal>
        </>
    )
}
