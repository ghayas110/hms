"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CreditCard, Receipt, Clock, Search, UserPlus, Loader2, CheckCircle } from "lucide-react"
import { patientService } from "@/lib/api/patient"
import { LogoutButton } from "@/components/auth/logout-button"

export default function CounterDashboard() {
  const [cnic, setCnic] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<{id: number, name: string, email: string} | null>(null)
  const [searchError, setSearchError] = useState("")

  const handleSearch = async () => {
    if (!cnic) return
    setSearching(true)
    setSearchError("")
    setSearchResult(null)
    try {
        const patient = await patientService.searchByCNIC(cnic)
        setSearchResult(patient)
    } catch (e: any) {
        console.error("Search failed", e)
        if (e.response?.status === 404) {
            setSearchError("Patient not found. Register new patient?")
        } else {
            setSearchError("Search failed. Please try again.")
        }
    } finally {
        setSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Counter Dashboard</h1>
        <LogoutButton />
      </div>
      
      {/* Search Section */}
      <Card className="border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600"/>
                Patient Check-in / Registration
            </CardTitle>
            <CardDescription>Enter CNIC to pull up patient details or register new.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-4 items-start max-w-lg">
                <div className="flex-1">
                    <input 
                        type="text" 
                        placeholder="Enter CNIC (e.g. 12345-1234567-1)" 
                        className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700"
                        value={cnic}
                        onChange={e => setCnic(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    {searchError && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        {searchError}
                        {searchError.includes("Register") && (
                            <button className="underline font-medium hover:text-red-800 ml-1">Register Now</button>
                        )}
                    </p>}
                </div>
                <button 
                    onClick={handleSearch}
                    disabled={searching || !cnic}
                    className="h-10 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {searching ? <Loader2 className="animate-spin h-4 w-4"/> : "Search"}
                </button>
            </div>

            {searchResult && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-950 rounded border border-green-200 dark:border-green-900 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600"/>
                            {searchResult.name}
                        </h3>
                        <p className="text-sm text-slate-500">{searchResult.email}</p>
                        <p className="text-xl text-slate-600 dark:text-slate-300">Wait for the cashier&apos;s confirmation.</p>
                        <p className="text-xs text-slate-400 mt-1">ID: {searchResult.id}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Book Appointment
                        </button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Patients in Queue
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Avg wait: 5 mins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250</div>
            <p className="text-xs text-muted-foreground">
              +10% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Bills
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Total: $450.00
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Transactions today
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
