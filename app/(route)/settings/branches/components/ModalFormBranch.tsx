import { FileDropInput, IconButton, Modal, PrimaryButton, Switch, TextInput } from "@/components"
import { initialBranch } from "@/constants";
import { handleApiRequest } from "@/helpers/apiHandler";
import { useToast } from "@/context/ToastContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Branch } from "@/types";
import { ChangeEvent, useState } from "react";
import { FaImage } from "react-icons/fa";

interface Props {
    fetchGetBraches: () => void;
    editBranch?: Branch;
    isFirstBranch?: boolean;
}

type BranchErrors = Partial<Record<keyof Branch | 'logo', string>>;

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

export const ModalFormBranch = ({ fetchGetBraches, editBranch, isFirstBranch }: Props) => {

    const isEdit = !!editBranch;

    const [isOpen, setIsOpen] = useState(false);
    const [branch, setBranch] = useState<Branch>(editBranch ?? initialBranch);
    const [logo, setLogo] = useState<File | null>(null);
    const [errors, setErrors] = useState<BranchErrors>({});
    const [isRemovingLogo, setIsRemovingLogo] = useState(false);
    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();

    const toggle = () => {
        if (!isOpen) {
            setBranch(editBranch ?? initialBranch);
            setLogo(null);
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

    const handleLogo = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // El backend valida igual (image|max:2048); se evita subir un archivo que va a rechazar
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, logo: 'El logo debe ser una imagen.' }));
            e.target.value = '';
            return;
        }
        if (file.size > MAX_LOGO_SIZE) {
            setErrors(prev => ({ ...prev, logo: 'El logo no debe pesar más de 2 MB.' }));
            e.target.value = '';
            return;
        }
        setLogo(file);
        setErrors(prev => ({ ...prev, logo: '' }));
    }

    // Con logo se envía multipart; PHP no parsea archivos en PUT, así que la edición va
    // como POST con _method=PUT (method spoofing de Laravel)
    const storeWithLogo = (file: File) => {
        const formData = new FormData();
        formData.append('store', String(branch.store));
        formData.append('address', branch.address);
        formData.append('name', branch.name ?? '');
        formData.append('type', branch.type);
        formData.append('logo', file);
        if (isEdit) {
            formData.append('_method', 'PUT');
        } else if (branch.cf !== undefined) {
            formData.append('cf', branch.cf ? '1' : '0');
        }
        const url = isEdit ? `branches/${branch.id}` : 'branches';
        return handleApiRequest(() => axiosAuth.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
    }

    // El establecimiento vuelve a usar el logo de la empresa en los comprobantes
    const removeLogo = async () => {
        setIsRemovingLogo(true);
        const { data, error } = await handleApiRequest<Branch>(() => axiosAuth.delete(`branches/${branch.id}/logo`));
        setIsRemovingLogo(false);

        if (!data) {
            setErrors(prev => ({ ...prev, logo: error ?? 'No se pudo quitar el logo.' }));
            return;
        }

        setBranch(prev => ({ ...prev, logo_dir: null, logo_url: null }));
        fetchGetBraches()
    }

    const store = async () => {
        const { errors: apiErrors, error } = logo
            ? await storeWithLogo(logo)
            : isEdit
                ? await handleApiRequest(() => axiosAuth.put(`branches/${branch.id}`, branch))
                : await handleApiRequest(() => axiosAuth.post('branches', branch));

        if (apiErrors) {
            setErrors(apiErrors);
            return;
        }

        // 403 / 413 / 500: no cerrar el modal como si se hubiera guardado
        if (error) {
            toast(error, 'error');
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

                <FileDropInput
                    name="logo"
                    label="Logo del establecimiento"
                    accept="image/*"
                    file={logo}
                    icon={<FaImage />}
                    imagePreview
                    existingUrl={branch.logo_url}
                    onChange={handleLogo}
                    onClear={() => setLogo(null)}
                />
                {errors.logo ? (
                    <p className="text-xs text-red-500 -mt-1 mb-2" aria-live="polite">{errors.logo}</p>
                ) : !logo && !branch.logo_url && (
                    <p className="text-xs text-ink-3 -mt-1 mb-2">Sin logo propio: los comprobantes usarán el logo de la empresa.</p>
                )}
                {isEdit && branch.logo_url && !logo && (
                    <button
                        type="button"
                        onClick={removeLogo}
                        disabled={isRemovingLogo}
                        className="text-xs font-medium text-red-500 hover:underline cursor-pointer disabled:opacity-50 -mt-1 mb-2"
                    >
                        {isRemovingLogo ? 'Quitando logo…' : 'Quitar logo (usar el de la empresa)'}
                    </button>
                )}

                <Switch name="type" label="Es Matriz" checked={branch.type === 'matriz'} disabled={branch.type === 'matriz'} onChange={handleTypeSwitch} />

                {!isEdit && isFirstBranch && (
                    <Switch name="cf" label="Crear consumidor final" description="Cliente genérico para ventas sin identificación" checked={!!branch.cf} onChange={handleCheckbox} />
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
