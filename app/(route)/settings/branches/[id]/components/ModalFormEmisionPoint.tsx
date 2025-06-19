import { Modal, PrimaryButton, TextInput } from "@/components"
import { initialEmisionPoint } from "@/constants";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { EmisionPointForm } from "@/types";
import { ChangeEvent, useState } from "react";

interface Props {
    branch_id: number,
    fetchGetEmisionPoints: () => void;
}

export const ModalFormEmisionPoint = ({ branch_id, fetchGetEmisionPoints }: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [emisionPoint, setEmisionPoint] = useState<EmisionPointForm>(initialEmisionPoint);
    const [errors, setErrors] = useState<Partial<Record<keyof EmisionPointForm, string>>>({});
    const axiosAuth = useAxiosAuth();

    const toggle = () => setIsOpen(prevState => !prevState)

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setEmisionPoint(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    }

    const store = async () => {
        try {
            await axiosAuth.post('points/store', { ...emisionPoint, branch_id });
            toggle()
            fetchGetEmisionPoints()
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
                <TextInput type='text' label='Punto de emisión *' value={emisionPoint.point + ''} error={errors.point} onChange={handleChange} name='point' maxLength={3} />
                <TextInput type='text' label='Factura *' value={emisionPoint.invoice + ''} error={errors.invoice} onChange={handleChange} name='invoice' maxLength={3} />
                <TextInput type='text' label='Nota de crédito *' value={emisionPoint.creditnote + ''} error={errors.creditnote} onChange={handleChange} name='creditnote' maxLength={3} />
                <TextInput type='text' label='Retención *' value={emisionPoint.retention + ''} error={errors.retention} onChange={handleChange} name='retention' maxLength={3} />
                <TextInput type='text' label='Guias de remisión *' value={emisionPoint.referralguide + ''} error={errors.referralguide} onChange={handleChange} name='referralguide' maxLength={3} />
                <TextInput type='text' label='Liquidaciones en compra *' value={emisionPoint.settlementonpurchase + ''} error={errors.settlementonpurchase} onChange={handleChange} name='settlementonpurchase' maxLength={3} />
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
