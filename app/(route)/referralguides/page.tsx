"use client";

import { ReferralGuidesProvider, useReferralGuides } from "./context/ReferralGuidesContext";
import ReferrralGuidesList from "./components/ReferrralGuidesList";
import { Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";

const PageReferralGuides = () => {

    const multipleActions: ActionsTitle[] = [
        { label: "", type: "link", url: '#', action: 'add' },
    ];

    const ReferralGuidesPagination = () => {
        const { meta, links, fetchReferralGuides } = useReferralGuides();

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchReferralGuides(pageUrl);
        };

        return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
    };

    return (
        <ReferralGuidesProvider>
            <div className="dark:text-gray-300">

                <Title
                    title="Guias de remisión"
                    subTitle="Lista de todas las guias de remisión"
                    actions={multipleActions}
                />
                <div className="md:mx-8 py-4">
                    <ReferrralGuidesList />
                    <ReferralGuidesPagination />
                </div>
            </div>
        </ReferralGuidesProvider>
    )
}

export default PageReferralGuides;
