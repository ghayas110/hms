"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Plus, Loader2, X, AlertCircle } from "lucide-react"
import { patientService } from "@/lib/api/patient"
import { authService } from "@/lib/api/auth"
import { Appointment, Doctor } from "@/lib/api/types"
import { addMinutes, format, parse, isBefore, startOfDay, isToday } from "date-fns"
import { LogoutButton } from "@/components/auth/logout-button"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    doctor_id: "",
    date: "",
    time: "",
    notes: "",
  })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [slotError, setSlotError] = useState("")

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const data = await patientService.getMyAppointments()
      
      // Fetch doctor details for each appointment
      const appointmentsWithDoctors = await Promise.all(
        data.map(async (appointment) => {
          try {
            const doctorData = await authService.getDoctorById(appointment.doctor_id)
            return { ...appointment, doctor: doctorData }
          } catch (err) {
            console.error(`Failed to fetch doctor details for appointment ${appointment.id}`, err)
            return appointment
          }
        })
      )
      
      setAppointments(appointmentsWithDoctors)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await authService.getAllDoctors(1, 100)
      setDoctors(response.data)
    } catch (error) {
      console.error("Failed to fetch doctors:", error)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [])

  // Generate slots based on doctor's shift
  const generateSlots = (doctor: Doctor) => {
    if (!doctor) return []
    
    // Default shifts if missing (fallback as per plan)
    const startStr = doctor.shift_start || "09:00:00"
    const endStr = doctor.shift_end || "17:00:00"
    
    const today = new Date()
    const baseDate = formData.date ? new Date(formData.date) : today
    const start = parse(startStr, 'HH:mm:ss', baseDate)
    const end = parse(endStr, 'HH:mm:ss', baseDate)
    
    // Fix parsing issues if any (e.g. if time string format varies)
    // Assuming HH:mm:ss based on typical SQL Time types
    
    const slots: string[] = []
    let current = start
    
    // Safety check date parsing
    if (isNaN(current.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid shift times", startStr, endStr)
        return []
    }

    // 20 minute intervals
    while (isBefore(current, end)) {
      slots.push(format(current, 'HH:mm'))
      current = addMinutes(current, 20)
    }
    
    return slots
  }

  useEffect(() => {
    if (formData.doctor_id && formData.date) {
      const doctor = doctors.find(d => d.id === parseInt(formData.doctor_id))
      console.log("Selected doctor:", doctor)
      if (doctor) {
        const slots = generateSlots(doctor)
        setAvailableSlots(slots)
      }
    } else {
        setAvailableSlots([])
    }
  }, [formData.doctor_id, formData.date, doctors])


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.time) {
        setSlotError("Please select a time slot")
        return
    }
    
    try {
      setSubmitting(true)
      await patientService.createAppointment({
        doctor_id: parseInt(formData.doctor_id),
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
      })
      setOpen(false)
      setFormData({ doctor_id: "", date: "", time: "", notes: "" })
      setSlotError("")
      fetchAppointments()
    } catch (error) {
      console.error("Failed to create appointment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelAppointment(appointmentId: number) {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    try {
      await patientService.cancelAppointment(appointmentId)
      fetchAppointments()
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      alert("Failed to cancel appointment. Please try again.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your appointments</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
            <Plus className="h-4 w-4" />
            Book Appointment
            </button>
            <LogoutButton />
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Book Appointment</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Select a doctor and time for your appointment.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Doctor</label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value, time: "" })}
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                   {doctor.User?.username} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              {formData.doctor_id && formData.date && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-1.5 block">Available Time Slots</label>
                    {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                            {availableSlots.map(slot => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => {
                                        setFormData({...formData, time: slot})
                                        setSlotError("")
                                    }}
                                    className={`text-xs py-2 px-1 rounded border transition-colors ${
                                        formData.time === slot 
                                        ? 'bg-teal-600 text-white border-teal-600' 
                                        : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No slots available (Check shift timings).</p>
                    )}
                    {slotError && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {slotError}</p>}
                  </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reason for visit..."
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 h-10 px-4 py-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col items-center justify-center py-8 text-center p-6">
            <Calendar className="h-12 w-12 text-slate-400" />
            <p className="mt-4 text-lg font-medium text-slate-500">No appointments found</p>
            <p className="text-sm text-slate-500">Book your first appointment to get started.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{appointment.doctor?.User?.username || "Unknown Doctor"}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.doctor?.specialization || "Specialist"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "completed" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{appointment.time}</span>
                  </div>
  
                </div>
                <div className="mt-4 flex gap-2">

                  <button 
                    onClick={() => handleCancelAppointment(appointment.id)}
                    disabled={appointment.status === "cancelled" || appointment.status === "completed"}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-red-200 bg-white text-red-600 hover:bg-red-50 h-9 px-3 dark:border-red-800 dark:bg-slate-950 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
