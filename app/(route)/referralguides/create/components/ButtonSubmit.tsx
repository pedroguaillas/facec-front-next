"use client";

import { PrimaryButton } from "@/components"
import { useReferralGuide } from "../context/ReferralGuideCreateContext";
import { referralGuideSchema } from "@/schemas/referral-guide.schema";

export const ButtonSubmit = () => {

  const { referralGuide, setErrors } = useReferralGuide();

  const handleSubmit = () => {

    // 1. Creación del fomulario
    const form = {
      ...referralGuide,
      send: true,
    }

    // 2. Validar formulario
    const parsed = referralGuideSchema.safeParse(form);

    if (!parsed.success) {
      console.log('Validacion ', parsed.error);
      const formatted: Record<string, string> = {};
      parsed.error.errors.forEach(err => {
        formatted[err.path[0] as string] = err.message;
      });
      setErrors(formatted);
      return;
    }

    // 3. Enviar formulario

  }
  return (
    <div className='flex justify-end mt-4'>
      <div>
        <PrimaryButton type="submit" label="Guardar y procesar" action="store" onClick={handleSubmit} />
      </div>
    </div>
  )
}
