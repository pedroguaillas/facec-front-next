export type states =
	| ''
	| 'CREADO'
	| 'FIRMADO'
	| 'ENVIADO'
	| 'RECIBIDA'
	| 'EN_PROCESO'
	| 'DEVUELTA'
	| 'AUTORIZADO'
	| 'NO AUTORIZADO'
	| 'ANULADO'
	| 'PENDIENTE DE ANULAR';

export type PaymentType = 'CONTADO' | 'CREDITO' | 'ANTICIPO';

export interface UserLookup {
	id: number;
	name: string;
	email: string;
}

interface EmisionPoint {
	id: number;
	branch_id: number;
	creditnote?: number;
	invoice?: number;
	store?: string;
	retention?: number;
	settlementonpurchase?: number;
	point: string;
	recognition: string | null;
	referralguide?: number;
}
