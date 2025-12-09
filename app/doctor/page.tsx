"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Search, Filter, Loader2, ArrowRight } from "lucide-react"
import { doctorService } from "@/lib/api/doctor"
import { Appointment } from "@/lib/api/types"
import Link from "next/link"
import { LogoutButton } from "@/components/auth/logout-button"

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<{ today: Appointment[], upcoming: Appointment[], all: Appointment[] }>({ today: [], upcoming: [], all: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const data = await doctorService.getAppointments()
        setAppointments(data)
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, Dr. Smith</p>
        </div>
        <div className="flex gap-4">
            <Link href="/doctor/schedule" className="px-4 py-2 bg-white border rounded-md hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                Manage Schedule
            </Link>
            <LogoutButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Appointments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              Today's Appointments
            </h2>
            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{appointments.today.length}</span>
          </div>

          <div className="grid gap-4">
            {appointments.today.length === 0 ? (
                <div className="p-8 border rounded-lg bg-white dark:bg-slate-950 text-center text-slate-500">
                    No appointments for today.
                </div>
            ) : (
                appointments.today.map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-4 p-4 rounded-lg border bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800">
                    <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold">{appointment.Patient?.name || appointment.Patient?.User?.username || "Unknown Patient"}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.time}
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {appointment.status}
                    </span>
                    </div>
                    
                    {appointment.status === 'approved' && (
                        <Link 
                            href={`/doctor/appointments/${appointment.id}/prescription`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 h-9 px-4 py-2 transition-colors w-full"
                        >
                            Start Consultation 
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    )}
                    {appointment.status === 'pending' && (
                        <button disabled className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 h-9 px-4 py-2 w-full cursor-not-allowed">
                            Waiting for Approval
                        </button>
                    )}
                    {appointment.status === 'completed' && (
                        <button disabled className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-100 text-slate-500 h-9 px-4 py-2 w-full cursor-not-allowed">
                            Completed
                        </button>
                    )}
                </div>
                ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Appointments
            </h2>
            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{appointments.upcoming.length}</span>
          </div>

          <div className="grid gap-4">
             {appointments.upcoming.length === 0 ? (
                <div className="p-8 border rounded-lg bg-white dark:bg-slate-950 text-center text-slate-500">
                    No upcoming appointments.
                </div>
            ) : (
                appointments.upcoming.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800">
                    <div>
                    <h3 className="font-semibold">{appointment?.Patient?.name || appointment?.Patient?.User?.username || "Unknown Patient"}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(appointment.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.time}
                        </span>
                    </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
