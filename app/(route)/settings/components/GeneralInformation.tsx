"use client";

import { PrimaryButton, SelectOption, TextInput } from "@/components"
import { useGeneralInformation } from "../hooks/useGeneralInformation";

export const GeneralInformation = () => {

    const { optionType, form, handleChange, handleCheckbox, handleFile, submit, downloadSign } = useGeneralInformation();

    const formatDateEcuador = (date: string) => {
        const expiresAt = new Date(date);
        const localDate = expiresAt.toLocaleString('es-EC', { timeZone: 'America/Guayaquil' });
        return localDate;
    }

    return (
        <>
            {/* Row */}
            <div className='sm:flex gap-4'>

                {/* Col 1 */}
                <div className='w-full'>
                    <div className='py-2'><span className='font-bold'>RUC: </span>{form.ruc}</div>
                    <div className='py-2'><span className='font-bold'>Razón social: </span>{form.company}</div>
                    <label className=" inline-flex gap-2 mt-2">
                        <input type="checkbox" checked={!!form.accounting} onChange={handleCheckbox} name="accounting" />
                        Es obligado llevar contabilidad?
                    </label>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Régimen" name='rimpe' options={optionType} selectedValue={form.rimpe} handleSelect={handleChange} />
                    </div>
                    <label className=" inline-flex gap-2">
                        <input type="checkbox" checked={!!form.retention_agent} onChange={handleCheckbox} name="retention_agent" />
                        Es agente de retención?
                    </label>
                </div>

                {/* Col 2 */}
                <div className='w-full'>
                    <div className='py-2 flex flex-col gap-2'>
                        <label className=" inline-flex gap-2 mt-2">Logo</label>
                        <input type="file" className="bg-gray-100 dark:bg-gray-700 w-fit" name="logo" onChange={handleFile} accept="image/*" />
                    </div>
                    <div className='py-2 lg:w-1/3'>
                        <TextInput type='password' label='Contraseña de firma electrónica' value={form.pass_cert} onChange={handleChange} name='pass_cert' maxLength={50} />
                    </div>
                    <div className='py-2 flex flex-col gap-2'>
                        <label className=" inline-flex gap-2 mt-2">Certificado de firma electrónica</label>
                        <input type="file" className="bg-gray-100 dark:bg-gray-700 w-fit" name="cert" onChange={handleFile} accept=".p12,.pfx" />
                        {form.sign_valid_to && <p><strong>Fecha de expiración:</strong> {formatDateEcuador(form.sign_valid_to)}</p>}
                    </div>
                    <div className='w-40'>
                        <PrimaryButton label='Descargar firma' type='submit' action='export' onClick={downloadSign} />
                    </div>
                </div>
            </div>

            <div className='flex justify-end'>
                <div className='w-28'>
                    <PrimaryButton label='Guardar' type='submit' action='store' onClick={submit} />
                </div>
            </div>
        </>
    )
}
