import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { SidebarWrapper } from "./sidebar-wrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper user={{ name: user.name, role: user.role }} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
