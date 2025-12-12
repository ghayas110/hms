"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, FileText, FlaskConical, Clock, Loader2, X, Check } from "lucide-react"
import { labService } from "@/lib/api/lab"
import { TestRequest, TestDefinition, TestParameter } from "@/lib/api/types"

export default function LabTestsPage() {
  const [tests, setTests] = useState<TestRequest[]>([])
  const [definitions, setDefinitions] = useState<TestDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Result Entry State
  const [selectedTest, setSelectedTest] = useState<TestRequest | null>(null)
  const [resultValue, setResultValue] = useState("")
  const [readings, setReadings] = useState<Record<string, string>>({})
  const [activeParams, setActiveParams] = useState<TestParameter[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [testsData, definitionsData] = await Promise.all([
        labService.getTestRequests(),
        labService.getTestDefinitions() 
      ])
      setTests(testsData)
      setDefinitions(definitionsData)
    } catch (e) {
      console.error("Failed to fetch lab data", e)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenResultModal = (test: TestRequest) => {
    setSelectedTest(test)
    
    // Check if result is existing structure
    const existingReadings: Record<string, string> = {}
    let existingSummary = ""

    if (test.result) {
        if (typeof test.result === 'string') {
            try {
                // Try parsing if it looks like JSON or just use as string
                const parsed = JSON.parse(test.result)
                if (parsed.summary || parsed.readings) {
                    existingSummary = parsed.summary || ""
                    if (parsed.readings && Array.isArray(parsed.readings)) {
                        parsed.readings.forEach((r: any) => {
                           existingReadings[r.name] = r.value 
                        })
                    }
                } else {
                    existingSummary = test.result
                }
            } catch (e) {
                existingSummary = test.result
            }
        } else if (typeof test.result === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = test.result as any;
            existingSummary = res.summary || ""
             if (res.readings && Array.isArray(res.readings)) {
                res.readings.forEach((r: any) => {
                    existingReadings[r.name] = r.value 
                })
            }
        }
    }

    setResultValue(existingSummary)
    setReadings(existingReadings)

    // Find definition
    const def = definitions.find(d => d.name === test.test_type)
    if (def && def.parameters) {
        setActiveParams(def.parameters)
    } else {
        setActiveParams([])
    }
  }

  const handleCloseModal = () => {
    setSelectedTest(null)
    setResultValue("")
    setReadings({})
    setActiveParams([])
  }

  const handleReadingChange = (paramName: string, value: string) => {
      setReadings(prev => ({ ...prev, [paramName]: value }))
  }

  const handleSubmitResult = async () => {
    if (!selectedTest) return

    try {
      setProcessing(true)
      await labService.addTestResult(selectedTest.id, { 
          result: resultValue,
          readings: Object.keys(readings).length > 0 ? readings : undefined
      })
      
      // Refresh only tests
      const updatedTests = await labService.getTestRequests()
      setTests(updatedTests)
      
      handleCloseModal()
    } catch (e) {
      alert("Failed to submit results")
      console.error(e)
    } finally {
      setProcessing(false)
    }
  }

  if (loading && tests.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Laboratory Tests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and process pending lab requests</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
           <Clock size={14}/> Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {tests.length === 0 ? (
            <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <FlaskConical className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No Pending Tests</h3>
                <p className="text-slate-500">There are no lab tests waiting to be processed.</p>
            </div>
        ) : (
            tests.map((test) => (
            <Card key={test.id} className="overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <span className="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg">
                            <FlaskConical className="h-4 w-4" />
                        </span>
                        {test.test_type}
                    </CardTitle>
                    <CardDescription className="mt-1 ml-1">
                        Requested on {new Date(test.created_at).toLocaleDateString()}
                    </CardDescription>
                    </div>
                    <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        test.status === "completed"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : test.status === "in_progress"
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                    }`}>
                        {test.status === 'pending' ? 'Pending' : test.status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm mb-4">
                    <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Patient</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {test.Patient?.name || test.patient?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">ID: {test.patient_id}</p>
                    </div>
                    <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Doctor</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                        Dr. {test.Doctor?.username || test.doctor?.username || "Unknown"}
                    </p>
                    </div>
                    <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Lab ID</span>
                    <p className="font-mono text-slate-600 dark:text-slate-400">LAB-{test.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Result</span>
                    <p className="font-medium">
                        {test.result ? (
                            <span className="text-green-600 flex items-center gap-1"><Check size={12}/> Recorded</span>
                        ) : (
                            <span className="text-slate-400 italic">Pending</span>
                        )}
                    </p>
                    {/* Simplified result preview */}
                    {test.result && typeof test.result === 'object' && (test.result as any).readings && (
                        <div className="mt-1 text-xs text-slate-500">
                            {(test.result as any).readings.length} param(s) evaluated
                        </div>
                    )}
                    </div>
                </div>
                
                <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    {test.status !== 'completed' && (
                        <Button size="sm" onClick={() => handleOpenResultModal(test)} className="bg-teal-600 hover:bg-teal-700 text-white">
                            <Activity size={16} className="mr-2" /> Enter Results
                        </Button>
                    )}
                    {test.status === 'completed' && (
                         <Button size="sm" variant="outline" onClick={() => handleOpenResultModal(test)}>
                            Edit Results
                        </Button>
                    )}
                    <Button size="sm" variant="outline">
                        <FileText size={16} className="mr-2"/> Print Label
                    </Button>
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>

      {/* Enter Result Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Enter Test Results</h3>
                    <button onClick={handleCloseModal} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex gap-4 text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div>
                            <span className="block text-xs text-slate-500">Test Type</span>
                            <span className="font-semibold">{selectedTest.test_type}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500">Patient</span>
                            <span className="font-semibold">{selectedTest.Patient?.name || selectedTest.patient?.name}</span>
                        </div>
                    </div>

                    {/* Parameter Inputs */}
                    {activeParams.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 border-b pb-1">Test Parameters</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeParams.map((param, i) => (
                                    <div key={i}>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            {param.name} {param.unit && <span className="text-slate-400">({param.unit})</span>}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                className="w-full p-2 border rounded-md text-sm dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-teal-500"
                                                placeholder={`Range: ${param.normal_range_min} - ${param.normal_range_max}`}
                                                value={readings[param.name] || ""}
                                                onChange={e => handleReadingChange(param.name, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Summary / Clinical Notes
                        </label>
                        <textarea 
                            className="w-full h-24 p-3 border rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
                            placeholder="Enter overall summary or evaluation..."
                            value={resultValue}
                            onChange={(e) => setResultValue(e.target.value)}
                        />
                         <p className="text-xs text-slate-500 mt-1">
                            This will mark the test as '{selectedTest.status === 'completed' ? 'Updated' : 'Completed'}'
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 z-10">
                    <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                    <Button 
                        onClick={handleSubmitResult} 
                        disabled={processing}
                        className="bg-teal-600 hover:bg-teal-700 text-white min-w-[100px]"
                    >
                        {processing ? <Loader2 size={16} className="animate-spin" /> : "Save Result"}
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
