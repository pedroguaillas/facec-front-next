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
                <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4 lg:p-8 mt-4 shadow-2xl">
                    <Tabs activeTab='establecimientos' />
                    <PointEmisionList />
                </div>
            </div>
        </div>
    )
}

export default PageEmisionPoints;
