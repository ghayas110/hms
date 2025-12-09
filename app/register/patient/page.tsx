"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, User } from "lucide-react"
import { authService } from "@/lib/api/auth"

export default function RegisterPatientPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    dob: "",
    gender: "male",
    cnic: "", // CNIC is mandatory
    contact_info: "",
    address: ""
  })

  // Since React 19 / Next 15 might be strict, ensure select handling is correct
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
        await authService.register({
            ...formData,
            role: 'patient',
            // Ensure types match expected RegisterPatientRequest
            gender: formData.gender as 'male' | 'female' | 'other'
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
      <div className="w-full max-w-lg space-y-6">
        <Link href="/register" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Role Selection
        </Link>
        
        <div className="rounded-lg border bg-white p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
             <div className="mb-6 flex flex-col space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Patient Registration</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Create your patient account to book appointments instantly.
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Name</label>
                        <input name="name" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="Full Name" onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Username</label>
                        <input name="username" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="Username" onChange={handleChange} />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <input name="email" type="email" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="name@example.com" onChange={handleChange} />
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Password</label>
                    <input name="password" type="password" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="******" onChange={handleChange} />
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">CNIC (Identity Number)</label>
                    <input name="cnic" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="12345-1234567-1" onChange={handleChange} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Date of Birth</label>
                        <input name="dob" type="date" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Gender</label>
                        <select name="gender" className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" onChange={handleChange}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Contact Number</label>
                    <input name="contact_info" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="+92 ..." onChange={handleChange} />
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium">Address</label>
                    <textarea name="address" required className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" placeholder="House #..." onChange={handleChange} />
                 </div>

                 {error && <div className="text-sm text-red-500 text-center">{error}</div>}

                 <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                    {submitting && <Loader2 className="animate-spin h-4 w-4"/>}
                    Create Account
                 </button>
             </form>
        </div>
      </div>
    </div>
  )
}
