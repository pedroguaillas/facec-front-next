import { Title } from "@/components";
import { Tabs } from "../../components/Tabs";
import { PointEmisionList } from "./components/PointEmisionList";

const PageEmisionPoints = () => {
    return (
        <div className='dark:text-gray-300'>
            <Title
                title="Puntos de emisión"
                subTitle='Lista de puntos de emisión'
            />
            <div className='md:mx-8 py-4'>
                {/* Card */}
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <Tabs activeTab='establecimientos' />
                    <PointEmisionList />
                </div>
            </div>
        </div>
    )
}

export default PageEmisionPoints;
