import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getLogs, getLogUsuarios, getLogModulos } from "@/lib/queries/logs"
import { TopBar } from "@/components/layout/top-bar"
import { BitacoraClient } from "./bitacora-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function BitacoraPage({ searchParams }: Props) {
  const user = await getUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard/overview")
  }

  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    usuario: params.usuario,
    modulo: params.modulo,
    accion: params.accion,
  }
  const page = Number(params.page) || 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logs: { data: any[]; total: number; page: number; pageSize: number; totalPages: number } = { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }
  let usuarios: string[] = []
  let modulos: string[] = []

  try {
    ;[logs, usuarios, modulos] = await Promise.all([
      getLogs(filters, page, 50),
      getLogUsuarios(),
      getLogModulos(),
    ])
  } catch {
    // AppLog table might not exist yet
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Bitácora" subtitle="Registro de actividades del sistema" />

      <div className="space-y-6 p-6">
        <BitacoraClient
          logs={logs}
          usuarios={usuarios}
          modulos={modulos}
        />
      </div>
    </div>
  )
}
