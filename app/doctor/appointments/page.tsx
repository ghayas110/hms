"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, Filter, Loader2, ArrowRight, User, CheckCircle, XCircle } from "lucide-react"
import { doctorService } from "@/lib/api/doctor"
import { Appointment } from "@/lib/api/types"
import Link from "next/link"

export default function AppointmentsHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'upcoming' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await doctorService.getAppointments()
      // The API returns { today, upcoming, all }. We want 'all'.
      setAppointments(data.all || []) 
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true
    // Logic to map 'upcoming' might be strictly date based, 
    // but usually 'upcoming' status isn't a DB status, it's 'scheduled' & future date.
    // However, the API returns categorized lists.
    // If the DB status is 'scheduled', we might treat it as 'upcoming' or 'pending' depending on implementation.
    // Let's rely on the status string from DB.
    
    // If filter is 'upcoming', we might match 'scheduled'.
    if (filter === 'upcoming' && app.status === 'scheduled') return true;
    
    return app.status === filter
  })

  // Sort by date/time descending (newest first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and view your consultation history.</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto">
            {(['all', 'pending', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)} // 'scheduled' is usually mapped to 'upcoming' visually if needed, but keeping simple
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                        filter === (f === 'scheduled' ? 'upcoming' : f) || (f === 'scheduled' && filter === 'upcoming') // Handle mismatched filter name if desired, or just use DB statuses
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                    }`}
                >
                    {f === 'scheduled' ? 'Upcoming' : f} 
                </button>
            ))}
        </div>
      </div>

      <div className="grid gap-4">
        {sortedAppointments.length === 0 ? (
             <div className="p-12 border rounded-lg bg-white dark:bg-slate-950 text-center flex flex-col items-center justify-center text-slate-500">
                <Calendar className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium">No appointments found</p>
                <p className="text-sm">Try adjusting your filters.</p>
            </div>
        ) : (
            sortedAppointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800 gap-4 hover:border-teal-500/30 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                             {appointment.status === 'completed' ? <CheckCircle size={24}/> :
                              appointment.status === 'cancelled' ? <XCircle size={24}/> :
                              <Calendar size={24}/>}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{appointment.Patient?.name || appointment.Patient?.User?.username || "Unknown Patient"}</h3>
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
                            {appointment.notes && (
                                <p className="text-sm text-slate-500 mt-2 italic border-l-2 pl-2 border-slate-200">
                                    "{appointment.notes}"
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end w-full md:w-auto">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            appointment.status === 'approved' ? 'bg-teal-100 text-teal-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {appointment.status}
                        </span>
                        
                        {/* Actions */}
                        {appointment.status === 'approved' && (
                            <Link 
                                href={`/doctor/appointments/${appointment.id}/prescription`}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 h-9 px-4 py-2 transition-colors ml-2"
                            >
                                Start Consultation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        )}
                         {appointment.status === 'completed' && (
                            <Link 
                                href={`/doctor/appointments/${appointment.id}/prescription`} // Assuming we can view it at same URL or a view-only version
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 h-9 px-4 py-2 transition-colors ml-2"
                            >
                                View Details (PDF)
                            </Link>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}
