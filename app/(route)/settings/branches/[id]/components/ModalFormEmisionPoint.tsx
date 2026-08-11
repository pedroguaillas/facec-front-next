import { IconButton, Modal, PrimaryButton, TextInput } from "@/components"
import { initialEmisionPoint } from "@/constants";
import { handleApiRequest } from "@/helpers/apiHandler";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { EmisionPoint, EmisionPointForm } from "@/types";
import { ChangeEvent, useState } from "react";

interface Props {
    branch_id: number,
    fetchGetEmisionPoints: () => void;
    editPoint?: EmisionPoint;
}

const toForm = (editPoint?: EmisionPoint): EmisionPointForm => editPoint ? {
    point: Number(editPoint.point),
    invoice: editPoint.invoice ?? 0,
    creditnote: editPoint.creditnote ?? 0,
    retention: editPoint.retention ?? 0,
    referralguide: editPoint.referralguide ?? 0,
    settlementonpurchase: editPoint.settlementonpurchase ?? 0,
    recognition: editPoint.recognition ?? '',
} : initialEmisionPoint;

export const ModalFormEmisionPoint = ({ branch_id, fetchGetEmisionPoints, editPoint }: Props) => {

    const isEdit = !!editPoint;

    const [isOpen, setIsOpen] = useState(false);
    const [emisionPoint, setEmisionPoint] = useState<EmisionPointForm>(toForm(editPoint));
    const [errors, setErrors] = useState<Partial<Record<keyof EmisionPointForm, string>>>({});
    const axiosAuth = useAxiosAuth();

    const toggle = () => {
        if (!isOpen) {
            setEmisionPoint(toForm(editPoint));
            setErrors({});
        }
        setIsOpen(prevState => !prevState);
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setEmisionPoint(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    }

    const store = async () => {
        const { errors: apiErrors } = isEdit
            ? await handleApiRequest(() => axiosAuth.put(`points/${editPoint.id}`, { ...emisionPoint, branch_id }))
            : await handleApiRequest(() => axiosAuth.post('points/store', { ...emisionPoint, branch_id }));

        if (apiErrors) {
            setErrors(apiErrors);
            return;
        }

        toggle()
        fetchGetEmisionPoints()
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
                title={isEdit ? "Editar punto de emisión" : "Registrar punto de emisión"}
                modalSize="sm"
            >
                <TextInput type='text' label='Punto de emisión' value={emisionPoint.point + ''} error={errors.point} onChange={handleChange} name='point' maxLength={3} required/>
                <TextInput type='text' label='Factura' value={emisionPoint.invoice + ''} error={errors.invoice} onChange={handleChange} name='invoice' maxLength={3} required/>
                <TextInput type='text' label='Nota de crédito' value={emisionPoint.creditnote + ''} error={errors.creditnote} onChange={handleChange} name='creditnote' maxLength={3} required/>
                <TextInput type='text' label='Retención' value={emisionPoint.retention + ''} error={errors.retention} onChange={handleChange} name='retention' maxLength={3} required/>
                <TextInput type='text' label='Guias de remisión' value={emisionPoint.referralguide + ''} error={errors.referralguide} onChange={handleChange} name='referralguide' maxLength={3} required/>
                <TextInput type='text' label='Liquidaciones en compra' value={emisionPoint.settlementonpurchase + ''} error={errors.settlementonpurchase} onChange={handleChange} name='settlementonpurchase' maxLength={3} required/>
                <TextInput type='text' label='Reconocimiento' value={emisionPoint.recognition ?? ''} error={errors.recognition} onChange={handleChange} name='recognition' maxLength={25} />

                <div className='flex justify-end py-2'>
                    <div>
                        <PrimaryButton label='Guardar' type='button' action='store' onClick={store} />
                    </div>
                </div>
            </Modal>
        </>
    )
}
