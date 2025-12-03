'use client';

import { TextInput, Switch } from '@/components';
import { useCompanyForm } from '../context/CompaniesFormContext';
import { axiosAuth } from '@/lib/axios';
import { updateCompany } from '../services/companiesServices';
import { Company } from '@/types';
import { useState } from 'react';

const PermissionFormCompany = () => {

    const { company, setCompany } = useCompanyForm();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChangeCheckbox = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        // Actualizar el estado local primero
        const updatedCompany = { ...company, [name]: checked };
        setCompany(updatedCompany);

        // Luego actualizar en el servidor con los datos actualizados
        await updateSetting(updatedCompany);
    }

    const updateSetting = async (updatedCompany: Company) => {
        if (isUpdating) return;

        setIsUpdating(true);
        const { data, errors } = await updateCompany(axiosAuth, updatedCompany, updatedCompany.id);
        setIsUpdating(false);
        
        if (data) {
            alert('Se ha echo un cambio en la compania');
            return;
        }
        console.log(errors);
    }

    return (
        <>
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full space-y-4'>

                    <h2 className='text-2xl font-bold my-6'>Ajustes de RUC {company.company}</h2>

                    <Switch
                        name="accounting"
                        label="Es obligado a llevar contabilidad?"
                        checked={company.accounting}
                        onChange={handleChangeCheckbox}
                    />

                    <div className='lg:w-2/3'>
                        <TextInput
                            name='retention_agent'
                            label='Es agente de retención?'
                            value={company.retention_agent.toString()}
                            onChange={handleChangeCheckbox}
                        />
                    </div>

                    <Switch
                        name="base5"
                        label="Registra productos de construcción (base 5%)?"
                        checked={company.base5}
                        onChange={handleChangeCheckbox}
                    />
                    <Switch
                        name="base8"
                        label="Registra servicios turisticos (base 8%)?"
                        checked={company.base8}
                        onChange={handleChangeCheckbox}
                    />
                    <Switch
                        name="ice"
                        label="Registra ICE?"
                        checked={company.ice}
                        onChange={handleChangeCheckbox}
                    />
                    <Switch
                        name="transport"
                        label="Registra servicio de transporte?"
                        checked={company.transport}
                        onChange={handleChangeCheckbox}
                    />
                    <Switch
                        name="repayment"
                        label="Emite factura por rembolso?"
                        checked={company.repayment}
                        onChange={handleChangeCheckbox}
                    />
                </div>

                {/* Col 2 */}
                <div className='w-full space-y-4'>

                    <h2 className='text-2xl font-bold my-6'>Permisos</h2>

                    <Switch
                        name="printf"
                        label="Imprime tickets?"
                        checked={company.printf}
                        onChange={handleChangeCheckbox}
                    />
                    <Switch
                        name="guia_in_invoice"
                        label="Registra guía en factura?"
                        checked={company.guia_in_invoice}
                        onChange={handleChangeCheckbox}
                    />
                    <Switch
                        name="import_in_invoice"
                        label="Importa productos en venta?"
                        checked={company.import_in_invoice}
                        onChange={handleChangeCheckbox}
                    />
                    <Switch
                        name="import_in_invoices"
                        label="Hace carga masiva de ventas?"
                        checked={company.import_in_invoices}
                        onChange={handleChangeCheckbox}
                    />
                </div>
            </div>
        </>
    )
}

export default PermissionFormCompany