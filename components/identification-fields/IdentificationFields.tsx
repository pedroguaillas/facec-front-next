"use client";

import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import { SegmentedControl } from "../segmented-control/SegmentedControl";
import { TextInput } from "../text-input/TextInput";

export type IdentificationType = 'cédula' | 'ruc' | 'pasaporte';
export type LookupStatus = 'idle' | 'searching' | 'found';

export const IDENTIFICATION_LENGTH: Record<IdentificationType, number> = {
    'cédula': 10,
    'ruc': 13,
    'pasaporte': 13,
};

// Cédula y RUC son numéricos y de largo exacto; el pasaporte es alfanumérico y de largo máximo
export const isNumericIdentification = (type: IdentificationType) => type !== 'pasaporte';

const typeOptions: { label: string; value: IdentificationType }[] = [
    { label: 'Cédula', value: 'cédula' },
    { label: 'RUC', value: 'ruc' },
    { label: 'Pasaporte', value: 'pasaporte' },
];

interface Props {
    // Tipos disponibles (por defecto los tres)
    types?: IdentificationType[];
    type: IdentificationType;
    identification: string;
    error?: string;
    lookupStatus?: LookupStatus;
    // En edición la identificación no se puede cambiar
    readOnly?: boolean;
    onTypeChange: (type: IdentificationType) => void;
    onIdentificationChange: (value: string) => void;
}

export const IdentificationFields = ({
    types,
    type,
    identification,
    error,
    lookupStatus = 'idle',
    readOnly,
    onTypeChange,
    onIdentificationChange,
}: Props) => {

    const numeric = isNumericIdentification(type);
    const maxLength = IDENTIFICATION_LENGTH[type];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = numeric ? e.target.value.replace(/\D/g, '') : e.target.value;
        onIdentificationChange(value);
    };

    const hint = readOnly
        ? 'La identificación no se puede modificar'
        : lookupStatus === 'searching'
            ? 'Buscando datos…'
            : numeric
                ? `Al completar los ${maxLength} dígitos se buscarán los datos automáticamente`
                : undefined;

    // Dentro del input: spinner al buscar, ✓ al encontrar o el contador de dígitos
    const endAdornment = lookupStatus === 'searching'
        ? <FaSpinner className="animate-spin text-gray-400" aria-hidden="true" />
        : lookupStatus === 'found'
            ? <FaCheckCircle className="text-emerald-500" aria-hidden="true" />
            : numeric && !readOnly
                ? <span className="text-xs tabular-nums text-gray-400" aria-hidden="true">{identification.length}/{maxLength}</span>
                : undefined;

    const options = types ? typeOptions.filter(option => types.includes(option.value)) : typeOptions;

    return (
        <>
            <SegmentedControl
                label="Tipo de identificación"
                name="type_identification"
                value={type}
                options={options}
                onChange={onTypeChange}
                disabled={readOnly}
            />
            <TextInput
                type="text"
                label="Identificación"
                name="identication"
                value={identification}
                error={error}
                success={lookupStatus === 'found' ? 'Datos encontrados. Revisa y completa la información.' : undefined}
                hint={hint}
                onChange={handleChange}
                maxLength={maxLength}
                inputMode={numeric ? 'numeric' : 'text'}
                placeholder={numeric ? '0'.repeat(maxLength) : 'Número de pasaporte'}
                endAdornment={endAdornment}
                endAdornmentPadding="pr-14"
                fieldClassName="sm:max-w-60"
                readOnly={readOnly}
                required
            />
        </>
    )
}
