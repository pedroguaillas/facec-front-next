'use client';

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState, } from 'react';
import { CarrierProps, CustomerProps, EmisionPoint, ProductOutput, ReferralGuideCreateProps, } from '@/types';
import { getCreateReferralGuide } from '../services/createReferralGuideServices';
import { initialProductItem } from '@/constants/initialValues';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { getDate } from '@/helpers/dateHelper';
import { useSession } from 'next-auth/react';
import { nanoid } from 'nanoid';

interface ReferralGuideContextType {
	referralGuide: ReferralGuideCreateProps;
	points: EmisionPoint[];
	selectPoint: EmisionPoint | null;
	selectCarrier: CarrierProps | null;
	selectCustom: CustomerProps | null;
	productOutputs: ProductOutput[];
	errors: Partial<Record<keyof ReferralGuideCreateProps, string>> & { products?: string };
	setReferralGuide: Dispatch<SetStateAction<ReferralGuideCreateProps>>;
	errorProductOutputs: Record<string, Partial<Record<keyof ProductOutput, string>>>;
	setSelectPoint: Dispatch<SetStateAction<EmisionPoint | null>>;
	setSelectCarrier: Dispatch<SetStateAction<CarrierProps | null>>;
	setSelectCustom: Dispatch<SetStateAction<CustomerProps | null>>;
	setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
	setErrors: Dispatch<SetStateAction<Partial<Record<keyof ReferralGuideCreateProps, string>>>>;
	setErrorProductOutputs: Dispatch<SetStateAction<Record<string, Partial<Record<keyof ProductOutput, string>>>>>;
}

const FormReferralGuideContext = createContext<ReferralGuideContextType | undefined>(undefined);

interface Props {
	children: ReactNode;
}

const initialReferralGuide: ReferralGuideCreateProps = {
	serie: 'Cree un punto de emisión',
	date_start: getDate(),
	date_end: getDate(),
	carrier_id: 0,
	customer_id: 0,
	address_from: '',
	address_to: '',
	reason_transfer: '',
};

export const FormReferralGuideProvider = ({ children }: Props) => {
	const [referralGuide, setReferralGuide] =
		useState<ReferralGuideCreateProps>(initialReferralGuide);
	const [points, setPoints] = useState<EmisionPoint[]>([]);
	const [selectCustom, setSelectCustom] = useState<CustomerProps | null>(null);
	const [selectPoint, setSelectPoint] = useState<EmisionPoint | null>(null);
	const [selectCarrier, setSelectCarrier] = useState<CarrierProps | null>(null);
	const [productOutputs, setProductOutputs] = useState<ProductOutput[]>([]);
	const [errors, setErrors] = useState<Partial<Record<keyof ReferralGuideCreateProps, string>>>({});
	const [errorProductOutputs, setErrorProductOutputs] = useState<
		Record<string, Partial<Record<keyof ProductOutput, string>>>
	>({});
	const { status } = useSession();
	const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

	useEffect(() => {
		const fetchCreateReferralGuide = async () => {
			if (status !== 'authenticated') return;

			try {
				const data = await getCreateReferralGuide(axiosAuth);
				setProductOutputs([{ ...initialProductItem, id: nanoid(), }]);
				const { points } = data;
				setPoints(points);
			} catch (error) {
				console.error('Error al cargar: ', error);
			}
		};

		fetchCreateReferralGuide();
	}, [status, axiosAuth]);

	return (
		<FormReferralGuideContext.Provider
			value={{
				referralGuide, points, selectCustom, selectPoint, selectCarrier, productOutputs, errors, errorProductOutputs,
				setReferralGuide, setSelectPoint, setSelectCustom, setSelectCarrier, setProductOutputs, setErrors, setErrorProductOutputs,
			}}
		>
			{children}
		</FormReferralGuideContext.Provider>
	);
};

export const useFormReferralGuide = () => {
	const context = useContext(FormReferralGuideContext);
	if (!context) {
		throw new Error('useFormReferralGuide must be used within an useFormReferralGuideProvider');
	}
	return context;
};
