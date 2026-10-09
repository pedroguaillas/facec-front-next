import { Title } from "@/components";
import { GeneralInformation } from "./components/GeneralInformation";
import { Tabs } from "./components/Tabs";

const PageSettings = () => {
  return (
    <div className="dark:text-gray-300">
      <Title
        title="Configuraciones"
        subTitle="Configuraciones del sistema"
      />
      <div className="md:mx-8 py-4">
        {/* Card */}
        <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
          <Tabs />
          <GeneralInformation />
        </div>
      </div>
    </div>
  )
}

export default PageSettings;
