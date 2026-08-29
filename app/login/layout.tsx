import { ReactNode } from "react"
import { InstallPrompt } from "@/components"

interface Props {
    children: ReactNode;
}

export default function layout({ children }: Props) {
    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-primarywhite via-primarywhite/50 to-primaryhover dark:from-primary dark:via-primary/80 dark:to-primaryhover/50">
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-8 shadow-xl shadow-primary/10 border border-[var(--border)]">
                {children}
            </div>
            <InstallPrompt />
        </div>
    )
}
