import { ActionsTitle } from "@/types";
import { PrimaryButton } from "../primary-button/PrimaryButton";

interface Props {
    title: string;
    subTitle: string;
    actions?: ActionsTitle | ActionsTitle[] | null;
}

export const Title = ({ title, subTitle, actions }: Props) => {
    return (
        <div
            className="px-6 py-5 md:px-8 flex justify-between items-center gap-4 border-b"
            style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
            }}
        >
            <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <h3 className="text-sm opacity-60 mt-0.5">{subTitle}</h3>
            </div>
            <div className="flex shrink-0 gap-2">
                {actions ? (
                    Array.isArray(actions) ? (
                        actions.map((action, index) => (
                            <PrimaryButton
                                key={index}
                                {...action}
                                compact
                            />
                        ))
                    ) : (
                        <PrimaryButton
                            {...actions}
                            compact
                        />
                    )
                ) : null}
            </div>
        </div>
    )
}
