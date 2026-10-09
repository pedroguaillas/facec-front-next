import { Title } from "@/components";
import { ReportComponent } from "./components/ReportComponent";

const PageReports = () => {
    return (
        <div className="dark:text-gray-300">
            <Title
                title="Reportes"
                subTitle="Reportes en excel"
            />
            <div className="md:mx-8 py-4">
                {/* Card */}
                <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 lg:p-8 mt-4">
                    <ReportComponent />
                </div>
            </div>
        </div>
    )
}

export default PageReports;