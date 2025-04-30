import { useFormStatus } from 'react-dom'
import { PrimaryButton, Separate } from '@/components';
import React from 'react'

export const ButtonSubmit = () => {

    const status = useFormStatus();

    return (
        <>
            <Separate />

            <div className='flex justify-end'>
                {/* <button
                    type='submit'
                    disabled={status.pending}
                    className='bg-blue-500 hover:bg-blue-700 disabled:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2'
                >
                    {status.pending && (
                        <FaSpinner className='animate-spin' />
                    )}
                    {!status.pending && (
                        <FaSave />
                    )}
                    Guardar
                </button> */}
                <div className='w-28'>
                    <PrimaryButton label='Guardar' type='submit' action='store' isLoading={status.pending} />
                </div>
            </div>
        </>
    )
}
