"use client";

import { FileDropInput, Modal, PrimaryButton, SelectOption, Switch, TextInput } from "@/components"
import { FaTriangleExclamation } from "react-icons/fa6";
import { useGeneralInformation } from "../hooks/useGeneralInformation";
import { FaFileSignature, FaImage } from "react-icons/fa";

export const GeneralInformation = () => {

    const {
        optionType, form, editingCert, isSaving, ivaConfirmMessage, fieldErrors,
        editCert, cancelEditCert, handleChange, handleCheckbox, handleFile, clearFile, submit, downloadSign,
        confirmIvaChange, cancelIvaChange,
    } = useGeneralInformation();

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
                    <div className='mt-2'>
                        <Switch name="accounting" label="¿Obligado a llevar contabilidad?" checked={!!form.accounting} onChange={handleCheckbox} />
                    </div>
                    <div className='lg:w-2/3'>
                        <SelectOption label="Régimen" name='rimpe' options={optionType} selectedValue={form.rimpe} handleSelect={handleChange} />
                    </div>
                    <Switch name="retention_agent" label="¿Agente de retención?" checked={!!form.retention_agent} onChange={handleCheckbox} />
                    <div className='lg:w-2/3'>
                        <TextInput
                            label='Nro. de calificación artesanal'
                            name='artisan_number'
                            value={form.artisan_number ?? ''}
                            error={fieldErrors.artisan_number}
                            onChange={handleChange}
                            maxLength={30}
                            hint='Déjalo vacío si no eres artesano calificado'
                        />
                    </div>
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
                    <PrimaryButton label='Guardar' type='submit' action='store' isLoading={isSaving} onClick={() => submit()} />
                </div>
            </div>

            {/* Pasar a RIMPE Negocio Popular cambia todos los productos a IVA 0%: el backend pide confirmación */}
            <Modal
                isOpen={ivaConfirmMessage !== null}
                onClose={cancelIvaChange}
                title="Cambiar a RIMPE Negocio Popular"
                modalSize="sm"
                footer={
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={cancelIvaChange}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-line-strong text-ink-1 hover:bg-surface-hover cursor-pointer disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmIvaChange}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primaryhover cursor-pointer disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando…' : 'Sí, cambiar a IVA 0%'}
                        </button>
                    </div>
                }
            >
                <div className="flex gap-3">
                    <FaTriangleExclamation className="shrink-0 mt-0.5 text-sri-wait" aria-hidden="true" />
                    <div className="space-y-2 text-sm">
                        <p className="text-ink-1">{ivaConfirmMessage}</p>
                        <p className="text-ink-3">Las ventas ya emitidas no se modifican.</p>
                    </div>
                </div>
            </Modal>
        </>
    )
}
