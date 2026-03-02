"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Loader2, Plus, Pencil, KeyRound, UserCheck, UserX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  username: string
  nombre: string
  role: string
  activo: boolean
  fechaCreacion: string
  ultimoAcceso: string | null
}

interface UsuariosClientProps {
  initialUsers: Record<string, unknown>[]
}

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "operador", label: "Operador" },
  { value: "auditor", label: "Auditor" },
]

function roleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case "admin": return "default"
    case "operador": return "secondary"
    default: return "outline"
  }
}

export function UsuariosClient({ initialUsers }: UsuariosClientProps) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [passwordUser, setPasswordUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Create form
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newNombre, setNewNombre] = useState("")
  const [newRole, setNewRole] = useState("operador")

  // Edit form
  const [editNombre, setEditNombre] = useState("")
  const [editRole, setEditRole] = useState("")

  // Password form
  const [newPwd, setNewPwd] = useState("")

  const users = initialUsers as unknown as User[]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword, nombre: newNombre, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al crear usuario")
        setLoading(false)
        return
      }
      setShowCreate(false)
      setNewUsername("")
      setNewPassword("")
      setNewNombre("")
      setNewRole("operador")
      router.refresh()
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: editNombre, role: editRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al actualizar")
        setLoading(false)
        return
      }
      setEditUser(null)
      router.refresh()
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordUser) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${passwordUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPwd }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al cambiar contraseña")
        setLoading(false)
        return
      }
      setPasswordUser(null)
      setNewPwd("")
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  const toggleActive = async (user: User) => {
    try {
      await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !user.activo }),
      })
      router.refresh()
    } catch {
      // ignore
    }
  }

  const openEdit = (user: User) => {
    setEditNombre(user.nombre)
    setEditRole(user.role)
    setEditUser(user)
    setError("")
  }

  const inputClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
  const selectClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
  const btnPrimary = "flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
  const btnOutline = "flex h-9 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"

  return (
    <>
      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Lista de Usuarios</h3>
        <button onClick={() => { setShowCreate(true); setError("") }} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Usuario</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Nombre</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Rol</th>
                <th className="px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Último Acceso</th>
                <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No hay usuarios. Ejecute POST /api/seed para crear la tabla y usuarios iniciales.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-mono text-xs">{u.username}</td>
                    <td className="px-3 py-2">{u.nombre}</td>
                    <td className="px-3 py-2">
                      <Badge variant={roleBadgeVariant(u.role)} className="capitalize">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {u.activo ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {u.ultimoAcceso ? formatDate(u.ultimoAcceso) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => { setPasswordUser(u); setNewPwd(""); setError("") }}
                          className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                          title="Cambiar Contraseña"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                          title={u.activo ? "Desactivar" : "Activar"}
                        >
                          {u.activo ? (
                            <UserX className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog: Create User */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>Crear un nuevo usuario del sistema</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Usuario</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="nombre.usuario"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nombre Completo</label>
              <input
                type="text"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="Nombre del usuario"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Rol</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className={selectClass}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <button type="button" onClick={() => setShowCreate(false)} className={btnOutline}>Cancelar</button>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Crear
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit User */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modificar datos de {editUser?.username}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nombre Completo</label>
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Rol</label>
              <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className={selectClass}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <button type="button" onClick={() => setEditUser(null)} className={btnOutline}>Cancelar</button>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Change Password */}
      <Dialog open={!!passwordUser} onOpenChange={(open) => !open && setPasswordUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>Nueva contraseña para {passwordUser?.username}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nueva Contraseña</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <button type="button" onClick={() => setPasswordUser(null)} className={btnOutline}>Cancelar</button>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Cambiar
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
