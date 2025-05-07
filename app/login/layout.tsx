import { ReactNode } from "react"

interface Props {
    children: ReactNode;
}

export default function layout({ children }: Props) {
    return (

        <div className="w-screen h-screen flex justify-center items-center bg-linear-to-r from-primarywhite to-primaryhover dark:from-primaryhover dark:to-primary">
            <div className="bg-sky-50 w-full max-w-sm rounded-xl p-8 border border-slate-400 sm:border-none">
                {children}
            </div>
        </div>
    )
}
