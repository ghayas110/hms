"use client"

import { Bell, User } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-slate-50/40 px-6 lg:h-[60px] dark:bg-slate-900/40">
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-10 w-10 dark:hover:bg-slate-800 dark:hover:text-slate-50">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </button>
      <button className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-10 w-10 dark:hover:bg-slate-800 dark:hover:text-slate-50">
         <User className="h-5 w-5" />
         <span className="sr-only">User menu</span>
      </button>
    </header>
  )
}
