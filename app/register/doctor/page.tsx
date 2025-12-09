"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Stethoscope } from "lucide-react"
import { authService } from "@/lib/api/auth"

export default function RegisterDoctorPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    specialization: "General Physician",
    consultation_fee: "",
    shift_start: "",
    shift_end: "",
  })

  // Note: Doctor interface in types.ts might need update if we want more fields here, but for now we stick to Request type:
  // RegisterDoctorRequest: username, email, password, role='doctor', specialization, consultation_fee

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
        await authService.register({
            ...formData,
            role: 'doctor',
            consultation_fee: parseInt(formData.consultation_fee)
        })
        // Redirect to login on success
        router.push('/login?registered=true')
    } catch (err: any) {
        console.error("Registration failed", err)
        setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
        setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/register" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Role Selection
        </Link>
        
        <div className="rounded-lg border bg-white p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
             <div className="mb-6 flex flex-col space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <Stethoscope className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Doctor Registration</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Join our medical staff to manage your practice.
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Username</label>
                    <input name="username" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="DrUsername" onChange={handleChange} />
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <input name="email" type="email" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="doctor@hms.com" onChange={handleChange} />
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Password</label>
                    <input name="password" type="password" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="******" onChange={handleChange} />
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Specialization</label>
                    <select name="specialization" className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" onChange={handleChange} value={formData.specialization}>
                        <option value="General Physician">General Physician</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Neurologist">Neurologist</option>
                    </select>
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Consultation Fee ($)</label>
                    <input name="consultation_fee" type="number" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="50" onChange={handleChange} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Shift Start</label>
                        <input name="shift_start" type="time" className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Shift End</label>
                        <input name="shift_end" type="time" className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" onChange={handleChange} />
                    </div>
                 </div>

                 {error && <div className="text-sm text-red-500 text-center">{error}</div>}

                 <button type="submit" disabled={submitting} className="w-full bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 disabled:opacity-50 flex justify-center items-center gap-2">
                    {submitting && <Loader2 className="animate-spin h-4 w-4"/>}
                    Register
                 </button>
             </form>
        </div>
      </div>
    </div>
  )
}
