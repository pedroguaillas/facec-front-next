import { useCallback, useEffect } from 'react';
import { useReferralGuide } from '../context/ReferralGuideCreateContext';

export const useSelectPoint = () => {
	const { points, selectPoint, setSelectPoint, setReferralGuide } = useReferralGuide();

	const handleSelectPoint = useCallback(() => {
		if (!selectPoint) return;

		const serie = `${selectPoint.store}-${selectPoint.point}-${String(
			selectPoint.referralguide
		).padStart(9, '0')}`;

		setReferralGuide(prev => ({ ...prev, serie }));
	}, [selectPoint, setReferralGuide]);

	const handlePoints = useCallback(() => {
		// 2do en ejecutar solo cuando hay un solo punto de emisión
		if (points.length === 1) {
			// console.log('useCallback de: points', { points });
			const selectedPoint = points[0];
			setSelectPoint(selectedPoint);
			setReferralGuide(prevState => ({
				...prevState,
				serie: `${selectedPoint.store}-${selectedPoint.point}-${(
					selectedPoint.referralguide + ''
				).padStart(9, '0')}`,
			}));
		}
	}, [points, setSelectPoint, setReferralGuide]);

	useEffect(() => {
		// 1ro en ejucutar
		// Se ejecuta inicio cuando llega los datos
		if (points.length > 0) {
			// console.log('useEffect de: points')
			handlePoints();
		}
	}, [points, handlePoints]);

	// Efecto para ejecutar handleSelectPoint cuando cambia selectPoint manualmente
	useEffect(() => {
		if (selectPoint) {
			handleSelectPoint();
		}
	}, [selectPoint, handleSelectPoint]);

	return { handleSelectPoint };
};
