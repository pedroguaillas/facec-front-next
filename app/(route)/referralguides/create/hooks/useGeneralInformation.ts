import { useReferralGuide } from '../context/ReferralGuideCreateContext';
import { CarrierProps, CustomerProps } from '@/types';

export const useGeneralInformation = () => {

    const { points, setReferralGuide, setSelectPoint, setSelectCarrier, setSelectCustom, setErrors, errors } = useReferralGuide();

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setReferralGuide((prevState) => ({ ...prevState, [name]: value }));

        if (name in errors) {
            setErrors(prevState => ({ ...prevState, [name]: '' }));
        }
    }

    const handleSelectPoint = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoint = points.find(point => point.id === Number(event.target.value));
        setSelectPoint(selectedPoint !== undefined ? selectedPoint : null);

        if ('serie' in errors) {
            setErrors(prev => ({ ...prev, serie: '' }));
        }
    }

    const handleSelectCustomer = (customer: CustomerProps) => {
        setReferralGuide((prevState) => ({ ...prevState, customer_id: customer.id }));
        setSelectCustom(customer);

        if ('customer_id' in errors) {
            setErrors(prev => ({ ...prev, customer_id: '' }));
        }
    }

    const handleSelectCarrier = (carrier: CarrierProps) => {
        setReferralGuide((prevState) => ({ ...prevState, carrier_id: carrier.id }));
        setSelectCarrier(carrier);

        if ('customer_id' in errors) {
            setErrors(prev => ({ ...prev, carrier_id: '' }));
        }
    }

    return { optionPoints, handleChange, handleSelectPoint, handleSelectCustomer, handleSelectCarrier };
}
