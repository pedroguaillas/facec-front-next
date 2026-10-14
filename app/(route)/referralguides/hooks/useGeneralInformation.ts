import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { CarrierProps, CustomerProps } from '@/types';
import { addDaysToDate } from '@/helpers/dateHelper';
import { GUIDE_DURATION_MAX_DAYS } from '@/constants/referralGuides';

export const useGeneralInformation = () => {

    const { points, setReferralGuide, setSelectPoint, setSelectCarrier, setSelectCustom, setErrors, errors } = useFormReferralGuide();

    const optionPoints = points.map((point) => ({
        value: point.id,
        label: `${point.store} - ${point.point} - ${point.recognition}`
    }));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setReferralGuide((prevState) => {
            const next = { ...prevState, [name]: value };
            // Al mover el inicio, el fin se acomoda dentro de su ventana (inicio … inicio + 8 días)
            if (name === 'date_start' && value) {
                const maxEnd = addDaysToDate(value, GUIDE_DURATION_MAX_DAYS);
                if (next.date_end < value) next.date_end = value;
                else if (next.date_end > maxEnd) next.date_end = maxEnd;
            }
            return next;
        });
        if (name === 'date_start') setErrors(prev => ({ ...prev, date_end: '' }));

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
        // La dirección del cliente propone el destino si aún está vacío
        setReferralGuide((prevState) => ({
            ...prevState,
            customer_id: customer.id,
            address_to: prevState.address_to.trim() ? prevState.address_to : (customer.atts.address ?? ''),
        }));
        setSelectCustom(customer);

        if ('customer_id' in errors) {
            setErrors(prev => ({ ...prev, customer_id: '' }));
        }
    }

    const handleSelectCarrier = (carrier: CarrierProps) => {
        setReferralGuide((prevState) => ({ ...prevState, carrier_id: carrier.id }));
        setSelectCarrier(carrier);

        if ('carrier_id' in errors) {
            setErrors(prev => ({ ...prev, carrier_id: '' }));
        }
    }

    return { optionPoints, handleChange, handleSelectPoint, handleSelectCustomer, handleSelectCarrier };
}
