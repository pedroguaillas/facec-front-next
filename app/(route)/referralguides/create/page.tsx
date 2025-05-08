import { Separate, Title } from "@/components";
import { ReferralGuideCreateProvider } from "./context/ReferralGuideCreateContext";
import { GeneralInformation } from "./components/GeneralInformation";

const PageCreateReferralGuide = () => {
    return (
        <ReferralGuideCreateProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Guia de remisión"
                    subTitle="Registrar un nuevo guia de remisión"
                />

                <div className='md:mx-8 py-4'>

                    {/* Card */}
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                        <h2>
                            <span className="font-bold">Nota: </span>
                            Los campos marcados con * son obligatorios
                        </h2>
                        <Separate />
                        <GeneralInformation />
                        <Separate />
                    </div>
                </div>
            </div>
        </ReferralGuideCreateProvider>
    )
}

export default PageCreateReferralGuide;
