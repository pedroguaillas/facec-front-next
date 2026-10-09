import { ReactNode } from "react"
import { AuthShell } from "@/components/auth-shell/AuthShell"

export default function layout({ children }: { children: ReactNode }) {
    return <AuthShell>{children}</AuthShell>;
}
