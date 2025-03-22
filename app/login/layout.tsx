import { ReactNode } from "react"

interface Props {
    children: ReactNode;
}

export default function layout({ children }: Props) {
    return (

        <div className="w-screen h-screen sm:bg-slate-800 flex justify-center items-center">
            <div className="bg-white w-full max-w-sm rounded-xl p-8 border border-slate-400 sm:border-none">
                {children}
            </div>
        </div>
    )
}
