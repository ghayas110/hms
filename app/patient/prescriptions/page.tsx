"use client"

import { useEffect, useState } from "react"
import { Pill, Download, Loader2 } from "lucide-react"
import { patientService } from "@/lib/api/patient"
import { Prescription } from "@/lib/api/types"

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await patientService.getMyPrescriptions()
        setPrescriptions(data)
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Prescriptions</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col items-center justify-center py-8 text-center p-6">
            <Pill className="h-12 w-12 text-slate-400" />
            <p className="mt-4 text-lg font-medium text-slate-500">No prescriptions found</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-teal-100 dark:bg-teal-900 p-2">
                      <Pill className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {prescription.medicines.map(m => m.name).join(", ")}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Prescribed by {prescription.doctor?.username || "Doctor"}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prescription.status === "fulfilled" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}>
                    {prescription.status}
                  </span>
                </div>
                <div className="grid gap-4">
                  {prescription.medicines.map((med, index) => (
                    <div key={index} className="grid gap-2 text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
                      <div className="font-medium">{med.name}</div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dosage:</span>
                        <span>{med.dosage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Frequency:</span>
                        <span>{med.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span>{med.duration}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-medium">{new Date(prescription.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 h-9 px-3 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
                    Request Refill
                  </button>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 h-9 px-3 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
                    <Download className="h-4 w-4" />
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
