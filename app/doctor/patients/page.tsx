import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, User } from "lucide-react"

export default function DoctorPatientsPage() {
  const patients = [
    {
      id: 1,
      name: "Olivia Martin",
      age: 34,
      gender: "Female",
      lastVisit: "2025-11-28",
      condition: "Hypertension",
      mrn: "MRN001234"
    },
    {
      id: 2,
      name: "Jackson Lee",
      age: 45,
      gender: "Male",
      lastVisit: "2025-11-27",
      condition: "Diabetes Type 2",
      mrn: "MRN001235"
    },
    {
      id: 3,
      name: "Emma Wilson",
      age: 28,
      gender: "Female",
      lastVisit: "2025-11-26",
      condition: "Asthma",
      mrn: "MRN001236"
    }
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Patients</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients by name or MRN..."
            className="pl-8"
          />
        </div>
        <Button>Add Patient</Button>
      </div>

      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{patient.name}</CardTitle>
                    <CardDescription>MRN: {patient.mrn}</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">Age</span>
                  <p className="font-medium">{patient.age} years</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender</span>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Visit</span>
                  <p className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Condition</span>
                  <p className="font-medium">{patient.condition}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
