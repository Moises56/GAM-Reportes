import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getUsers } from "@/lib/queries/users"
import { TopBar } from "@/components/layout/top-bar"
import { KPICard } from "@/components/dashboard/kpi-card"
import { UsuariosClient } from "./usuarios-client"

export default async function UsuariosPage() {
  const user = await getUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard/overview")
  }

  let users: Record<string, unknown>[] = []
  try {
    users = await getUsers()
  } catch {
    // AppUser table might not exist yet
  }

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.activo).length
  const adminCount = users.filter((u) => u.role === "admin").length

  return (
    <div className="flex flex-col">
      <TopBar title="Usuarios" subtitle="Gestión de usuarios y roles" />

      <div className="space-y-6 p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total Usuarios"
            value={totalUsers}
            icon="Users"
          />
          <KPICard
            label="Activos"
            value={activeUsers}
            subtitle={`${totalUsers - activeUsers} inactivos`}
            icon="Shield"
          />
          <KPICard
            label="Administradores"
            value={adminCount}
            icon="Shield"
          />
          <KPICard
            label="Operadores"
            value={users.filter((u) => u.role === "operador").length}
            icon="FileText"
          />
        </div>

        <UsuariosClient initialUsers={users} />
      </div>
    </div>
  )
}
