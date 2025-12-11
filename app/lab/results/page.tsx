"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { labService } from "@/lib/api/lab"
import { TestRequest } from "@/lib/api/types"
import { Search, FileText, Calendar, User, Activity, CheckCircle2, FlaskConical, Loader2, Download, Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"

export default function LabResultsPage() {
  const [results, setResults] = useState<TestRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResult, setSelectedResult] = useState<TestRequest | null>(null)
  
  const reportRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
      contentRef: reportRef,
      documentTitle: `Lab_Report_${selectedResult?.Patient?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}`
  })

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const data = await labService.getCompletedResults()
      setResults(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter(r => 
    r.Patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.test_type?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.toString().includes(searchTerm)
  )

  const parseResult = (resultStr: string | any) => {
      if (typeof resultStr === 'string') {
          try {
              return JSON.parse(resultStr)
          } catch {
              return { summary: resultStr }
          }
      }
      return resultStr
  }

  const formatDate = (dateString: string | undefined) => {
      if (!dateString) return "N/A"
      try {
          return new Date(dateString).toLocaleDateString()
      } catch {
          return "Invalid Date"
      }
  }

  const getDoctorName = (test: TestRequest) => {
      return test.Doctor?.User?.username || test.Doctor?.username || "Unknown"
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Lab Results</h1>
          <p className="text-slate-500 dark:text-slate-400">View and print verified test reports</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search patient, test..." 
            className="pl-9 bg-white dark:bg-slate-950"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResults.length === 0 ? (
             <div className="col-span-full text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <FlaskConical className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No Results Found</h3>
             </div>
          ) : (
             filteredResults.map((test) => (
                <Card key={test.id} className="cursor-pointer hover:border-teal-500 transition-colors group" onClick={() => setSelectedResult(test)}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                {test.test_type}
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                                {test.Patient?.name || "Unknown Patient"}
                            </CardDescription>
                        </div>
                        <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-600 p-2 rounded-lg group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
                            <FileText size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1">
                                <Calendar size={12}/>
                                {formatDate(test.created_at)}
                            </div>
                             <div className="flex items-center gap-1">
                                <User size={12}/>
                                Dr. {getDoctorName(test)}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 font-normal">
                                <CheckCircle2 size={10} className="mr-1"/> Completed
                            </Badge>
                            <span className="text-xs text-slate-400">LAB-{test.id.toString().padStart(6, '0')}</span>
                        </div>
                    </CardContent>
                </Card>
             ))
          )}
        </div>
      )}

      {selectedResult && (
        <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
               <div className="flex justify-end gap-2 mb-2 print:hidden">
                    <Button variant="outline" size="sm" onClick={() => handlePrint()} className="gap-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200">
                        <Download size={14}/> Download Report
                    </Button>
               </div>


               <style type="text/css" media="print">
                   {`
                   @page { size: auto; margin: 20mm; }
                   `}
               </style>

               {/* Printable Report Area */}
               <div ref={reportRef} className="bg-white p-8 rounded-lg text-slate-900 border border-slate-200 shadow-sm print:shadow-none print:border-0 print:p-0">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-teal-600">
                        <div>
                            <h2 className="text-2xl font-bold text-teal-700 uppercase tracking-tight">Lab Test Report</h2>
                            <p className="text-sm text-slate-500 mt-1 font-mono">ID: LAB-{selectedResult.id.toString().padStart(6, '0')}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-lg text-slate-900">Bajwa Hospital</h3>
                            <p className="text-xs text-slate-600">123 Health Ave, Medical District</p>
                            <p className="text-xs text-slate-600">Phone: (555) 123-4567</p>
                            <p className="text-xs text-slate-600">Email: lab@bajwahospital.com</p>
                        </div>
                    </div>

                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8 text-sm bg-slate-50 p-4 rounded-lg print:bg-transparent print:p-0">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Patient Details</p>
                            <p className="font-bold text-base text-slate-900">{selectedResult.Patient?.name || selectedResult.patient?.name || "Unknown"}</p>
                            <div className="grid grid-cols-2 gap-x-4 mt-1 text-slate-600">
                                <p>ID: <span className="font-mono text-slate-900">{selectedResult.patient_id}</span></p>
                                <p>Gender: <span className="text-slate-900">{selectedResult.Patient?.gender || "N/A"}</span></p>
                                <p>Age: <span className="text-slate-900">{selectedResult.Patient?.age || "N/A"}</span></p>
                                <p>Phone: <span className="text-slate-900">{selectedResult.Patient?.contact_info || "N/A"}</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Request Information</p>
                             <p className="font-bold text-base text-slate-900">Dr. {getDoctorName(selectedResult)}</p>
                             <p className="text-slate-600 mt-1">Requested: {formatDate(selectedResult.created_at)}</p>
                             <p className="text-slate-600">Reported: {formatDate(selectedResult.updated_at || selectedResult.created_at)}</p>
                        </div>
                    </div>

                    {/* Test Title */}
                    <div className="mb-6 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                             <FlaskConical className="text-teal-600" size={20}/>
                             <span className="text-lg font-bold text-slate-900">{selectedResult.test_type}</span>
                        </div>
                    </div>

                    {/* Results Table */}
                    {(() => {
                        const parsed = parseResult(selectedResult.result);
                        return (
                            <div className="space-y-8">
                                {parsed.readings && Array.isArray(parsed.readings) && parsed.readings.length > 0 ? (
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-100 text-slate-700 border-b-2 border-slate-200">
                                            <tr>
                                                <th className="p-3 font-bold">Investigation</th>
                                                <th className="p-3 font-bold">Result</th>
                                                <th className="p-3 font-bold">Reference Range</th>
                                                <th className="p-3 font-bold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {parsed.readings.map((reading: any, i: number) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 print:bg-transparent'}>
                                                    <td className="p-3 font-medium text-slate-800">{reading.name}</td>
                                                    <td className="p-3 font-bold text-base">{reading.value} <span className="text-slate-500 font-normal text-xs">{reading.unit}</span></td>
                                                    <td className="p-3 text-slate-500">{reading.normal_range}</td>
                                                    <td className="p-3 text-center">
                                                         {reading.status !== 'Normal' ? (
                                                             <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                                                reading.status === "High" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                                             }`}>
                                                                 {reading.status}
                                                             </span>
                                                         ) : (
                                                             <span className="text-teal-700 text-xs font-bold flex items-center justify-center gap-1">
                                                                <CheckCircle2 size={12}/> Normal
                                                             </span>
                                                         )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                     <div className="p-4 border rounded bg-slate-50 text-center text-slate-500 italic">
                                        No structured readings available.
                                     </div>
                                )}

                                {/* Summary Note */}
                                {parsed.summary && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Clinical Interpretation / Comments</p>
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed print:bg-transparent print:border-none print:p-0">
                                            {parsed.summary}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()}

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 items-end">
                        <div className="text-xs text-slate-400">
                            <p>Generated electronically by Hospital Management System</p>
                            <p>{new Date().toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                             <div className="h-16 w-48 border-b border-slate-300 mb-2 mx-auto"></div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Lab Technician Sign & Stamp</p>
                        </div>
                    </div>
               </div>

                <div className="flex justify-end pt-4 print:hidden">
                    <Button onClick={() => setSelectedResult(null)}>Close Viewer</Button>
                </div>
            </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
