import { ActionsTitle } from "@/types";
import { PrimaryButton } from "../primary-button/PrimaryButton";

interface Props {
    title: string;
    subTitle: string;
    actions?: ActionsTitle | ActionsTitle[] | null;
}

export const Title = ({ title, subTitle, actions }: Props) => {
    return (
        <div className="p-4 md:p-8 flex justify-between items-center bg-gray-100 dark:bg-gray-700/70">
            <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <h3>{subTitle}</h3>
            </div>
            <div className="flex gap-2">
                {actions ? (
                    Array.isArray(actions) ? (
                        // Render multiple buttons if actions is an array
                        actions.map((action, index) => (
                            <PrimaryButton
                                key={index}
                                {...action}
                            />
                        ))
                    ) : (
                        // Render a single button if actions is an object
                        <PrimaryButton
                            {...actions}
                        />
                    )
                ) : null}
            </div>
        </div>
    )
}
