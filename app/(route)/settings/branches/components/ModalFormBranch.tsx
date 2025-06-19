import { Modal, PrimaryButton, SelectOption, TextInput } from "@/components"
import { initialBranch } from "@/constants";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Branch } from "@/types";
import { ChangeEvent, useState } from "react";

interface Props {
    fetchGetBraches: () => void;
}

export const ModalFormBranch = ({ fetchGetBraches }: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [branch, setBranch] = useState<Branch>(initialBranch);
    const [errors, setErrors] = useState<Partial<Record<keyof Branch, string>>>({});
    const axiosAuth = useAxiosAuth();

    const toggle = () => setIsOpen(prevState => !prevState)

    const optionType = [
        { label: 'Matriz', value: 'matriz' },
        { label: 'Sucursal', value: 'sucursal' },
    ]

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setBranch(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    }

    const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setBranch(prev => ({ ...prev, [name]: checked }))
    }

    const store = async () => {
        try {
            await axiosAuth.post('branches', branch);
            toggle()
            fetchGetBraches()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className='flex justify-end pt-4'>
                <div>
                    <PrimaryButton label='Agregar' type='button' action='add' onClick={toggle} />
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onClose={toggle}
                title="Registrar establecimiento"
                modalSize="sm"
            >
                <TextInput type='text' label='Establecimiento *' value={branch.store + ''} error={errors.store} onChange={handleChange} name='store' maxLength={3} />
                <TextInput type='text' label='Dirección *' value={branch.address} error={errors.address} onChange={handleChange} name='address' maxLength={300} />
                <TextInput type='text' label='Nombre ' value={branch.name ?? ''} error={errors.name} onChange={handleChange} name='name' maxLength={300} />

                <SelectOption label="Tipo" name='type' options={optionType} selectedValue={branch.type} handleSelect={handleChange} />

                <label className=" inline-flex gap-2 mt-2">
                    <input type="checkbox" checked={!!branch.cf} onChange={handleCheckbox} name="cf" />
                    Crear consumidor final?
                </label>

                <div className='flex justify-end py-2'>
                    <div>
                        <PrimaryButton label='Guardar' type='button' action='store' onClick={store} />
                    </div>
                </div>
            </Modal>
        </>
    )
}
