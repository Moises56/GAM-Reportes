"use client"

import { Sidebar } from "@/components/layout/sidebar"

interface SidebarWrapperProps {
  user: { name: string; role: string }
}

export function SidebarWrapper({ user }: SidebarWrapperProps) {
  return <Sidebar user={user} />
}
