"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear all local storage items
    localStorage.clear()
    // Redirect to home page
    router.push('/')
  }

  return (
    <button 
      onClick={handleLogout}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors ${className}`}
      title="Logout"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  )
}
