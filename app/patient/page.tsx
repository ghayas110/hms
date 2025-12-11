"use client"

import { useEffect, useState } from "react"
import { Calendar, Activity, FileText, Clock, Loader2, ArrowRight } from "lucide-react"
import { patientService } from "@/lib/api/patient"
import { PatientDashboardStats } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function PatientDashboard() {
  const [stats, setStats] = useState<PatientDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await patientService.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch patient stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Upcoming Appointments */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">
              Upcoming Appointments
            </h3>
            <Calendar className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.upcomingCount || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stats?.nextAppointment ? (
                  <>
                    Next: {new Date(stats.nextAppointment.date).toLocaleDateString()}
                    <br />
                    w/ Dr. {stats.nextAppointment.doctor?.User?.username || "Unknown"}
                  </>
              ) : (
                  "No upcoming appointments"
              )}
            </p>
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">
              Active Prescriptions
            </h3>
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.activePrescriptionsCount || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
               Pending Fulfillment
            </p>
          </div>
        </div>

        {/* Recent Vitals */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">
              Recent Vitals
            </h3>
            <Activity className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.recentVitals ? "Recorded" : "N/A"}</div>
            {stats?.recentVitals ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                   {stats.recentVitals.blood_pressure && <p>BP: {stats.recentVitals.blood_pressure}</p>}
                   {stats.recentVitals.pulse_rate && <p>HR: {stats.recentVitals.pulse_rate}</p>}
                   {stats.recentVitals.temperature && <p>Temp: {stats.recentVitals.temperature}</p>}
                   {(!stats.recentVitals.blood_pressure && !stats.recentVitals.pulse_rate) && "Vitals data available"}
                </div>
            ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No recent vitals found
                </p>
            )}
          </div>
        </div>

        {/* Pending Bills */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">
              Pending Bills
            </h3>
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">${stats?.pendingBillsSum?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
               {stats?.pendingBillsSum && stats.pendingBillsSum > 0 ? "Payment required" : "All bills paid"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <div className="col-span-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          <div className="p-6 pt-0">
             {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                 <div className="space-y-4">
                     {stats.recentActivity.map((apt) => (
                         <div key={apt.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                             <div>
                                 <p className="font-medium text-sm">Appointment with Dr. {apt.doctor?.User?.username || "Unknown"}</p>
                                 <p className="text-xs text-muted-foreground">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                             </div>
                             <Badge variant={apt.status === 'scheduled' || apt.status === 'approved' ? 'default' : 'secondary'}>
                                 {apt.status}
                             </Badge>
                         </div>
                     ))}
                 </div>
             ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                No recent activity to show.
                </p>
             )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-3 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="p-6 pt-0 grid gap-2">
             <Link href="/patient/appointments" className="w-full">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Calendar className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>Book Appointment</span>
                        <span className="text-xs text-muted-foreground">Schedule a visit with a doctor</span>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
                </Button>
             </Link>
             
             <Link href="/patient/prescriptions" className="w-full">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>View Prescriptions</span>
                        <span className="text-xs text-muted-foreground">Check your medication history</span>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
                </Button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
