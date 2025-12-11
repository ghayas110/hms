"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    LayoutDashboard, Calendar, FileText, User, Settings, LogOut, 
    Users, Activity, Stethoscope, Pill, TestTube, ChevronLeft, ChevronRight,
    Beaker, ClipboardList, ShoppingBag, CreditCard, Clock
} from "lucide-react"
import { authService } from "@/lib/api/auth"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "patient" | "doctor" | "admin" | "counter" | "pharmacy" | "lab"
}

export function Sidebar({ className, role = "patient" }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("sidebarCollapsed")
    if (saved) setIsCollapsed(saved === "true")
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const handleLogout = () => {
    authService.logout()
  }

  if (!mounted) return <div className="w-64 bg-slate-50/40 dark:bg-slate-900/40 border-r min-h-screen" />

  const patientLinks = [
    { href: "/patient", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/appointments", label: "Appointments", icon: Calendar },
    { href: "/patient/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/patient/profile", label: "Profile", icon: User },
  ]

  const doctorLinks = [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar }, // Added Appointments link
    // { href: "/doctor/schedule", label: "Schedule", icon: Clock }, // Changed icon to distinguish
    // { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/diagnosis", label: "Diagnosis", icon: Stethoscope },
    { href: "/doctor/medicine-group", label: "Medicine Groups", icon: Pill },
    { href: "/doctor/test-category", label: "Test Categories", icon: Beaker }, // Changed to Beaker for better distinction
  ]

  const counterLinks = [
    { href: "/counter", label: "Dashboard", icon: LayoutDashboard },
    { href: "/counter/billing", label: "Billing", icon: CreditCard },
    { href: "/counter/queue", label: "Queue", icon: Users },
  ]

  const pharmacyLinks = [
    { href: "/pharmacy", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pharmacy/inventory", label: "Inventory", icon: ClipboardList },
    { href: "/pharmacy/dispense", label: "Dispense", icon: ShoppingBag },
  ]

  const labLinks = [
    { href: "/lab", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lab/tests", label: "Tests", icon: TestTube },
    { href: "/lab/results", label: "Results", icon: FileText },
    { href: "/lab/test-management", label: "Test Management", icon: Settings },
  ]
  
  let links = patientLinks
  if (role === "doctor") links = doctorLinks
  if (role === "counter") links = counterLinks
  if (role === "pharmacy") links = pharmacyLinks
  if (role === "lab") links = labLinks

  return (
    <div 
        className={`relative flex flex-col border-r bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-20" : "w-64"
        } ${className || ""}`}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 bg-white dark:bg-slate-800 border rounded-full p-1 shadow-md hover:bg-slate-100 z-50 text-slate-500"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex-1 py-6 flex flex-col gap-2">
        {/* Logo / Header */}
        <div className={`px-4 mb-6 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
           {isCollapsed ? (
             <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                M
             </div>
           ) : (
             <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    M
                </div>
                <div>
                     <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">Bajwa Hospital</h2>
                     <p className="text-[10px] text-slate-500 font-medium">MANAGEMENT SYSTEM</p>
                </div>
             </div>
           )}
        </div>

        {/* Navigation */}
        <div className="px-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center rounded-lg transition-all duration-200 group relative ${
                  isCollapsed ? "justify-center p-3" : "px-4 py-2.5"
                } ${
                  pathname === link.href 
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                }`}
              >
                <link.icon className={`transition-all duration-300 ${
                    pathname === link.href ? "text-teal-600 dark:text-teal-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                } ${isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"}`} />
                
                {!isCollapsed && (
                    <span className="font-medium text-sm">{link.label}</span>
                )}
                
                {/* Active Indicator Strip */}
                {pathname === link.href && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-teal-600 rounded-r-full" />
                )}
              </Link>
            ))}
        </div>
      </div>
      
      {/* Footer / Settings */}
      <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/50">
        <div className="space-y-1">
             <Link 
               href="/settings"
               title="Settings"
               className={`flex items-center rounded-lg transition-colors ${
                 isCollapsed ? "justify-center p-3" : "px-4 py-2.5"
               } ${
                 pathname === "/settings" 
                   ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50" 
                   : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
               }`}
             >
               <Settings className={`${isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"}`} />
               {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
             </Link>
             
             <button 
                onClick={handleLogout}
                title="Logout" 
                className={`flex items-center w-full rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 ${
                 isCollapsed ? "justify-center p-3" : "px-4 py-2.5"
             }`}>
               <LogOut className={`${isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"}`} />
               {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
             </button>
        </div>
      </div>
    </div>
  )
}
