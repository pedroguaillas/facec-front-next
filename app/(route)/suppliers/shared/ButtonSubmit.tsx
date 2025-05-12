import { PrimaryButton, Separate } from "@/components"
import { useFormStatus } from "react-dom";

export const ButtonSubmit = () => {
    const status = useFormStatus();
    return (
        <>
            <Separate />

            <div className='flex justify-end'>
                <div className='w-28'>
                    <PrimaryButton label='Guardar' type='submit' action='store' isLoading={status.pending} />
                </div>
            </div>
        </>
    )
}