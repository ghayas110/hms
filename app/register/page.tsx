import Link from "next/link"
import { User, Stethoscope, Pill, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Admin Portal</h1>
          <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400">
            Select your role to get started with the Hospital Management System.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Patient Card */}
            <Link href="/register/patient" className="group relative flex flex-col items-center gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Patient</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Book appointments, view prescriptions and manage your health records.
                    </p>
                </div>
                <div className="mt-auto pt-4 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1">
                    Register as Patient <ArrowRight className="h-4 w-4"/>
                </div>
            </Link>

            {/* Doctor Card */}
            <Link href="/register/doctor" className="group relative flex flex-col items-center gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <Stethoscope className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Doctor</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage appointments, write prescriptions and track patient history.
                    </p>
                </div>
                <div className="mt-auto pt-4 text-sm font-medium text-teal-600 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1">
                    Register as Doctor <ArrowRight className="h-4 w-4"/>
                </div>
            </Link>

            {/* Pharmacist Card */}
            <Link href="/register/pharmacist" className="group relative flex flex-col items-center gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Pill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Pharmacist</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage inventory, dispense medicines and track stock levels.
                    </p>
                </div>
                <div className="mt-auto pt-4 text-sm font-medium text-purple-600 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1">
                    Register as Pharmacist <ArrowRight className="h-4 w-4"/>
                </div>
            </Link>
        </div>

        <div className="text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-medium underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100">Login here</Link>
        </div>
      </div>
    </div>
  )
}
