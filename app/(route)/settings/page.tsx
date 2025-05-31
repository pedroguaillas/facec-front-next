import { Title } from "@/components";
import { GeneralInformation } from "./components/GeneralInformation";

const PageSettings = () => {
  return (
    <div className="dark:text-gray-300">
      <Title
        title="Configuraciones"
        subTitle="Configuraciones del sistema"
      />
      <div className="md:mx-8 py-4">
        {/* Card */}
        <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
          <GeneralInformation />
        </div>
      </div>
    </div>
  )
}

export default PageSettings;
