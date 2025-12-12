import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus, Users } from "lucide-react"

export default function DoctorSchedulePage() {
  const schedule = [
    {
      id: 1,
      day: "Monday",
      slots: [
        { time: "09:00 AM - 12:00 PM", patients: 8, available: 4 },
        { time: "02:00 PM - 05:00 PM", patients: 6, available: 6 }
      ]
    },
    {
      id: 2,
      day: "Tuesday",
      slots: [
        { time: "09:00 AM - 12:00 PM", patients: 10, available: 2 },
        { time: "02:00 PM - 05:00 PM", patients: 8, available: 4 }
      ]
    },
    {
      id: 3,
      day: "Wednesday",
      slots: [
        { time: "09:00 AM - 12:00 PM", patients: 7, available: 5 },
        { time: "02:00 PM - 05:00 PM", patients: 9, available: 3 }
      ]
    },
    {
      id: 4,
      day: "Thursday",
      slots: [
        { time: "09:00 AM - 12:00 PM", patients: 11, available: 1 },
        { time: "02:00 PM - 05:00 PM", patients: 7, available: 5 }
      ]
    },
    {
      id: 5,
      day: "Friday",
      slots: [
        { time: "09:00 AM - 12:00 PM", patients: 9, available: 3 },
        { time: "02:00 PM - 05:00 PM", patients: 5, available: 7 }
      ]
    }
  ]

  const todayAppointments = [
    { time: "09:00 AM", patient: "Olivia Martin", type: "General Checkup", status: "Confirmed" },
    { time: "09:30 AM", patient: "Jackson Lee", type: "Follow-up", status: "Confirmed" },
    { time: "10:00 AM", patient: "Emma Wilson", type: "Consultation", status: "Pending" },
    { time: "10:30 AM", patient: "Liam Johnson", type: "Lab Review", status: "Confirmed" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Time Slot
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Monday, December 1, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((apt, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium min-w-[80px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {apt.time}
                    </div>
                    <div>
                      <p className="font-medium">{apt.patient}</p>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === "Confirmed" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Manage your availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.map((day) => (
                <div key={day.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{day.day}</h3>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {day.slots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{slot.time}</span>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{slot.patients}</span>
                          <span className="text-muted-foreground">/ {slot.patients + slot.available}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
