"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, Activity, FileText, Loader2, ArrowRight } from "lucide-react"
import { pharmacyService } from "@/lib/api/pharmacy"
import { PharmacyDashboardStats } from "@/lib/api/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function PharmacyDashboard() {
  const [stats, setStats] = useState<PharmacyDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await pharmacyService.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch pharmacy stats:", error)
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
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold tracking-tight">Pharmacy Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prescriptions to Fill
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.prescriptionsToFill || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.urgentPrescriptions || 0} urgent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lowStockItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Restock needed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inventory
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInventory || 0}</div>
            <p className="text-xs text-muted-foreground">
              Items in stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dispensed Today
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dispensedToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Prescriptions completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Prescriptions */}
        <Card className="col-span-4 max-h-[400px] overflow-y-auto">
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recentPrescriptions && stats.recentPrescriptions.length > 0 ? (
                stats.recentPrescriptions.map((px) => (
                    <div key={px.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div>
                            <p className="font-medium text-sm">RX-{px.id}</p>
                            <p className="text-xs text-muted-foreground">
                                {px.Appointment?.Patient?.name || px.Appointment?.patient?.name || "Unknown Patient"} 
                                {(px.Appointment?.Doctor?.User?.username || px.Appointment?.doctor?.User?.username) && ` • Dr. ${px.Appointment.Doctor?.User?.username || px.Appointment.doctor?.User?.username}`}
                            </p>
                        </div>
                        <div className="text-right">
                             <Badge variant={px.status === 'pending' ? 'outline' : 'secondary'} className="mb-1 text-xs">
                                {px.status}
                             </Badge>
                             <p className="text-[10px] text-muted-foreground">{new Date(px.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">
                No recent prescriptions.
                </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
             <Link href="/pharmacy/dispense" className="w-full">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Activity className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>Dispense Medicine</span>
                        <span className="text-xs text-muted-foreground">View pending prescriptions and fulfill orders</span>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
                </Button>
             </Link>
             
             <Link href="/pharmacy/inventory" className="w-full">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Package className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>Manage Inventory</span>
                        <span className="text-xs text-muted-foreground">Add stock, update items, check expiration</span>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
                </Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
