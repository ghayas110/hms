import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, FileText, FlaskConical, Clock } from "lucide-react"

export default function LabTestsPage() {
  const tests = [
    {
      id: 1,
      testId: "LAB-2025-045",
      patientName: "Olivia Martin",
      patientMRN: "MRN001234",
      testType: "Complete Blood Count (CBC)",
      requestedBy: "Dr. Sarah Smith",
      requestDate: "2025-12-01",
      priority: "Urgent",
      status: "In Progress",
      sampleCollected: true
    },
    {
      id: 2,
      testId: "LAB-2025-046",
      patientName: "Jackson Lee",
      patientMRN: "MRN001235",
      testType: "Lipid Panel",
      requestedBy: "Dr. John Doe",
      requestDate: "2025-12-01",
      priority: "Routine",
      status: "Pending",
      sampleCollected: false
    },
    {
      id: 3,
      testId: "LAB-2025-047",
      patientName: "Emma Wilson",
      patientMRN: "MRN001236",
      testType: "HbA1c",
      requestedBy: "Dr. Sarah Smith",
      requestDate: "2025-12-01",
      priority: "Routine",
      status: "In Progress",
      sampleCollected: true
    },
    {
      id: 4,
      testId: "LAB-2025-048",
      patientName: "Liam Johnson",
      patientMRN: "MRN001237",
      testType: "Thyroid Function Test",
      requestedBy: "Dr. John Doe",
      requestDate: "2025-11-30",
      priority: "Urgent",
      status: "Completed",
      sampleCollected: true
    }
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Laboratory Tests</h1>
        <Button>New Test Request</Button>
      </div>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    {test.testId}
                  </CardTitle>
                  <CardDescription>{test.testType}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    test.priority === "Urgent"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}>
                    {test.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    test.status === "Completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : test.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}>
                    {test.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Patient</span>
                  <p className="font-medium">{test.patientName}</p>
                  <p className="text-xs text-muted-foreground">{test.patientMRN}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Requested By</span>
                  <p className="font-medium">{test.requestedBy}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Request Date</span>
                  <p className="font-medium">{new Date(test.requestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sample</span>
                  <p className="font-medium">{test.sampleCollected ? "Collected" : "Pending"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {test.status === "Pending" && (
                  <Button size="sm">Collect Sample</Button>
                )}
                {test.status === "In Progress" && (
                  <Button size="sm">Enter Results</Button>
                )}
                {test.status === "Completed" && (
                  <Button size="sm" variant="outline">View Results</Button>
                )}
                <Button size="sm" variant="outline">Print Label</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
