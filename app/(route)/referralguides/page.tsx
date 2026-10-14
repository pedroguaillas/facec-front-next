"use client";

import { ReferralGuidesProvider, useReferralGuides } from "./context/ReferralGuidesContext";
import ReferrralGuidesList from "./components/ReferrralGuidesList";
import { Paginate, Title } from "@/components";
import { ActionsTitle } from "@/types";
import { usePlan } from "@/lib/hooks/usePlan";

const PageReferralGuides = () => {

    const { canEmit } = usePlan();
    const multipleActions: ActionsTitle[] = [
        { label: "Nueva guía", type: "link", url: '/referralguides/create', action: 'add', disabled: !canEmit, title: canEmit ? 'Nueva guía' : 'Tu plan está vencido' },
    ];

    const ReferralGuidesPagination = () => {
        const { meta, links, fetchReferralGuides, setPage } = useReferralGuides();

        const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
            e.preventDefault();
            fetchReferralGuides(pageUrl);
            setPage(parseInt(pageUrl?.match(/page=(\d+)/)?.[1] || '1'));
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
