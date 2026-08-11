"use client";

import { FileDropInput, PrimaryButton, SelectOption, TextInput } from "@/components"
import { useGeneralInformation } from "../hooks/useGeneralInformation";
import { FaFileSignature, FaImage } from "react-icons/fa";

export const GeneralInformation = () => {

    const { optionType, form, editingCert, editCert, cancelEditCert, handleChange, handleCheckbox, handleFile, clearFile, submit, downloadSign } = useGeneralInformation();

    const logoUrl = form.logo_url;

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
                    <FileDropInput
                        name="logo"
                        label="Logo"
                        accept="image/*"
                        file={form.logo}
                        icon={<FaImage />}
                        imagePreview
                        existingUrl={logoUrl}
                        onChange={handleFile}
                        onClear={() => clearFile('logo')}
                    />
                    {editingCert ? (
                        <>
                            <div className='py-2 lg:w-1/3'>
                                <TextInput type='password' label='Contraseña de firma electrónica' value={form.pass_cert} onChange={handleChange} name='pass_cert' maxLength={50} />
                            </div>
                            <FileDropInput
                                name="cert"
                                label="Certificado de firma electrónica"
                                accept=".p12,.pfx"
                                file={form.cert}
                                icon={<FaFileSignature />}
                                existingLabel={form.sign_valid_to ? 'Certificado cargado' : undefined}
                                onChange={handleFile}
                                onClear={() => clearFile('cert')}
                            />
                            {form.sign_valid_to && <p className='text-sm'><strong>Fecha de expiración:</strong> {formatDateEcuador(form.sign_valid_to)}</p>}
                            {form.has_cert && (
                                <div className='w-32 mt-2'>
                                    <PrimaryButton label='Cancelar' type='button' action='back' onClick={cancelEditCert} />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className='text-sm py-2'><FaFileSignature className='inline mr-1' /> Certificado cargado</p>
                            {form.sign_valid_to && <p className='text-sm'><strong>Fecha de expiración:</strong> {formatDateEcuador(form.sign_valid_to)}</p>}
                            <div className='flex gap-2 mt-2'>
                                <div className='w-40'>
                                    <PrimaryButton label='Editar firma' type='button' action='edit' onClick={editCert} />
                                </div>
                                {form.sign_valid_to && new Date(form.sign_valid_to) > new Date() && (
                                    <div className='w-40'>
                                        <PrimaryButton label='Descargar firma' type='submit' action='export' onClick={downloadSign} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
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
