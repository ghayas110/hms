import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, CheckCircle } from "lucide-react"

export default function LabResultsPage() {
  const results = [
    {
      id: 1,
      testId: "LAB-2025-044",
      patientName: "Sophia Anderson",
      patientMRN: "MRN001238",
      testType: "Complete Blood Count (CBC)",
      completedDate: "2025-11-30",
      status: "Released",
      technician: "Lab Tech A",
      results: {
        "WBC": { value: "7.5", unit: "10^3/μL", range: "4.5-11.0", status: "Normal" },
        "RBC": { value: "4.8", unit: "10^6/μL", range: "4.5-5.5", status: "Normal" },
        "Hemoglobin": { value: "14.2", unit: "g/dL", range: "13.5-17.5", status: "Normal" },
        "Platelets": { value: "250", unit: "10^3/μL", range: "150-400", status: "Normal" }
      }
    },
    {
      id: 2,
      testId: "LAB-2025-043",
      patientName: "Michael Brown",
      patientMRN: "MRN001239",
      testType: "Lipid Panel",
      completedDate: "2025-11-30",
      status: "Pending Approval",
      technician: "Lab Tech B",
      results: {
        "Total Cholesterol": { value: "220", unit: "mg/dL", range: "<200", status: "High" },
        "LDL": { value: "145", unit: "mg/dL", range: "<100", status: "High" },
        "HDL": { value: "45", unit: "mg/dL", range: ">40", status: "Normal" },
        "Triglycerides": { value: "180", unit: "mg/dL", range: "<150", status: "High" }
      }
    }
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Test Results</h1>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {result.testId} - {result.testType}
                  </CardTitle>
                  <CardDescription>
                    Patient: {result.patientName} ({result.patientMRN})
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.status === "Released"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}>
                  {result.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed Date</span>
                    <p className="font-medium">{new Date(result.completedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Technician</span>
                    <p className="font-medium">{result.technician}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Test Results</h4>
                  <div className="space-y-2">
                    {Object.entries(result.results).map(([test, data]) => (
                      <div key={test} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1">
                          <p className="font-medium">{test}</p>
                          <p className="text-sm text-muted-foreground">Reference: {data.range}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold">{data.value} {data.unit}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            data.status === "Normal"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {data.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {result.status === "Pending Approval" && (
                    <Button size="sm">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve & Release
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                  <Button size="sm" variant="outline">Print</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
