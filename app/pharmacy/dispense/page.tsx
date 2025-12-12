"use client"

import { useEffect, useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Pill, User, FileText, Loader2, CheckCircle, Eye, Printer, AlertCircle, Activity, DollarSign, Calendar, CloudCog } from "lucide-react"
import { pharmacyService } from "@/lib/api/pharmacy"
import { patientService } from "@/lib/api/patient" 
import { billingService } from "@/lib/api/billing"
import { Prescription, Patient, Appointment, Medicine } from "@/lib/api/types"
import { LogoutButton } from "@/components/auth/logout-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"


interface InvoiceLine {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    found: boolean;
}

export default function PharmacyDispensePage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [processingId, setProcessingId] = useState<number | null>(null)
  
  // Patient Details Modal State
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null)
  const [loadingPatient, setLoadingPatient] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Rx Details Modal State
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [isRxDetailsOpen, setIsRxDetailsOpen] = useState(false)

  // Invoice State
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  
  // New State for Invoice Calculation
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([])
  const [calculatingInvoice, setCalculatingInvoice] = useState(false)
  
  // Print Logic
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [lastInvoiceId, setLastInvoiceId] = useState<number | null>(null)
  
  const handlePrintInvoice = useReactToPrint({
      contentRef: invoiceRef,
      documentTitle: `Invoice_${selectedPrescription?.Appointment?.patient?.name || 'Patient'}_${new Date().toLocaleDateString()}`
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await pharmacyService.getPrescriptionsToFulfill()
      setPrescriptions(data || [])
    } catch (error) {
       console.error("Failed to fetch prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  // Modified handleOpenInvoice to accept an optional prescription argument
  // to support calling from the card button directly
  const handleOpenInvoice = async (prescriptionOverride?: Prescription) => {
       const targetPrescription = prescriptionOverride || selectedPrescription
       if (!targetPrescription) return
       
       if (prescriptionOverride) setSelectedPrescription(prescriptionOverride)

      setCalculatingInvoice(true)
      setIsInvoiceOpen(true)
      setInvoiceLines([])
      setInvoiceAmount("")

      try {
          const lines: InvoiceLine[] = []
          let totalStr = 0

          for (const med of targetPrescription.medicines) {
              // Default to 0 if not found
              let unitPrice = 0
              let found = false
              
              try {
                  // Search inventory by name
                  // Ideally we should have exact match or ID, but name search is what we have
                  const inventoryItems = await pharmacyService.getInventory(med.name)
                  
                  // Find best match (exact string match case-insensitive)
                  const match = inventoryItems.find(i => 
                      i.medicine_name.toLowerCase() === med.name.toLowerCase()
                  )
                  
                  if (match) {
                      unitPrice = Number(match.price)
                      found = true
                  }
              } catch (e) {
                  console.error(`Failed to fetch price for ${med.name}`, e)
              }

              const qty = med.quantity || 1
              const total = unitPrice * qty
              
              lines.push({
                  name: med.name,
                  quantity: qty,
                  unitPrice: unitPrice,
                  total: total,
                  found: found
              })
              
              totalStr += total
          }

          setInvoiceLines(lines)
          setInvoiceAmount(totalStr.toFixed(2))

      } catch (e) {
          console.error("Error calculating invoice", e)
          setInvoiceAmount("0.00")
      } finally {
          setCalculatingInvoice(false)
      }
  }

  const handleReviewDispense = async (p: Prescription) => {
      setSelectedPrescription(p)
      handleOpenInvoice(p) 
  }

  const handleViewDetails = async (patientId: number) => {
      setSelectedPatientId(patientId)
      setIsDetailsOpen(true)
      setLoadingPatient(true)
      try {
          const data = await pharmacyService.getPatientById(patientId)
          setPatientDetails(data)
      } catch (error) {
          console.error("Failed to fetch patient details", error)
          setPatientDetails(null)
      } finally {
          setLoadingPatient(false)
      }
  }

  const handleViewRxDetails = (p: Prescription) => {
      setSelectedPrescription(p)
      setIsRxDetailsOpen(true)
  }

  const handleConfirmDispense = async () => {
      if (!selectedPrescription || !invoiceAmount) return

      try {
          setCreatingInvoice(true)
          
          // Call dispense instead of createInvoice
          // The backend will create the invoice
          const response = await pharmacyService.dispensePrescription(selectedPrescription.id)
          
          if (response.invoice) {
              setLastInvoiceId(response.invoice.id)
              // Wait a brief moment for state to update if necessary, then print
              setTimeout(() => {
                  handlePrintInvoice()
              }, 500)
              
               alert("Prescription dispensed and Invoice created! Printing Invoice...")
          } else {
              alert("Prescription dispensed.")
          }
          
          setIsInvoiceOpen(false)
          await loadData()
          setIsRxDetailsOpen(false) // Close details if open

      } catch (error) {
          console.error("Failed to dispense", error)
          alert("Failed to dispense prescription")
      } finally {
          setCreatingInvoice(false)
      }
  }

  const handlePrintLabel = (p: Prescription) => {
      alert(`Printing label for RX-${p.id}...`)
  }

  const filteredPrescriptions = prescriptions.filter(p => {
      const searchLower = searchQuery.toLowerCase()
      const patientName = p.Appointment?.patient?.name || "Unknown Patient"
      const mrn = p.Appointment?.patient_id ? `P${p.Appointment?.patient_id}` : "" 
      const id = `RX-${p.id}`.toLowerCase()
      
      return patientName.toLowerCase().includes(searchLower) || mrn.toLowerCase().includes(searchLower) || id.includes(searchLower)
  })
  console.log(filteredPrescriptions ,"prescriptions")

  // Helper to format date
  const formatDate = (dateStr?: string) => {
      if (!dateStr) return "N/A"
      return new Date(dateStr).toLocaleDateString()
  }
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispense Medications</h1>
            <p className="text-muted-foreground">Manage and fulfill patient prescriptions.</p>
        </div>
        <LogoutButton />
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Prescription ID, Patient Name, or ID..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button variant="outline">
                <Loader2 className="mr-2 h-4 w-4" /> Scan QR
            </Button>
        </CardContent>
      </Card>

      {/* Main Content: Responsive Grid */}
      <div className="space-y-4">
            {loading ? (
                 <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredPrescriptions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground border rounded-lg bg-card">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No pending prescriptions found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPrescriptions.map((p) => {
                        const pName = p?.Appointment?.Patient?.name || "Unk Patient"
                        const pId = p?.Appointment?.patient_id || "Unk Patient"
                        const dName = p.Appointment?.Doctor?.User?.username || "Unknown Doctor"
                        console.log(pId,pName, dName)
                
                        
                        return (
                            <Card key={p.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base font-semibold">RX-{p.id}</CardTitle>
                                            {/* <CardDescription>{formatDate(p.created_at)}</CardDescription> */}
                                        </div>
                                        <Badge variant={p.status === 'pending' ? "default" : "secondary"}>
                                            {p.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pb-3">
                                    <div className="space-y-3">
                                        {/* Patient Info */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{pName}</span>
                                                <span className="text-xs text-muted-foreground">ID: {pId|| "N/A"}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Doctor Info */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            <span>Dr. {dName}</span>
                                        </div>

                                        {/* Medicines */}
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">Medicines</Label>
                                            <div className="flex flex-wrap gap-1">
                                                {(p.medicines || []).map((m, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {m.name} ({m.quantity || 1})
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0 mt-auto flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewRxDetails(p)}>
                                        <Eye className="h-4 w-4 mr-2" /> View Rx
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => typeof pId === 'number' && handleViewDetails(pId)} disabled={typeof pId !== 'number'}>
                                        <User className="h-4 w-4 mr-2" /> History
                                    </Button>
                                </div>
                                <div className="px-4 pb-4 pt-0">
                                    <Button 
                                        size="sm" 
                                        className="w-full bg-teal-600 hover:bg-teal-700"
                                        onClick={() => handleReviewDispense(p)}
                                        disabled={processingId === p.id}
                                    >
                                        {processingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dispense"}
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
      </div>

      {/* Rx Details Modal */}
      <Dialog open={isRxDetailsOpen} onOpenChange={setIsRxDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Prescription Details (RX-{selectedPrescription?.id})</DialogTitle>
                  <DialogDescription>
                      Issued on {formatDate(selectedPrescription?.created_at)} by Dr. {selectedPrescription?.doctor?.User?.username || "Unknown"}
                  </DialogDescription>
              </DialogHeader>
              
              {selectedPrescription && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          {/* Appointment Details */}
                          {selectedPrescription.Appointment && (
                              <div className="border p-4 rounded-lg">
                                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                                      <Calendar className="h-4 w-4" /> Appointment Details
                                  </h3>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div><span className="text-muted-foreground">ID:</span> {selectedPrescription.Appointment.id}</div>
                                      <div><span className="text-muted-foreground">Date:</span> {formatDate(selectedPrescription.Appointment.date)}</div>
                                      <div><span className="text-muted-foreground">Time:</span> {selectedPrescription.Appointment.time}</div>
                                      <div className="capitalize"><span className="text-muted-foreground">Status:</span> {selectedPrescription.Appointment.status}</div>
                                  </div>
                              </div>
                          )}

                          {/* Complaints & Diagnosis */}
                          <div className="border p-4 rounded-lg">
                              <h3 className="font-semibold mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4" /> Clinical Info
                              </h3>
                              <div className="space-y-2 text-sm">
                                  <div>
                                      <span className="font-medium text-muted-foreground text-xs uppercase">Diagnosis</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                          {selectedPrescription.diagnosis?.length ? (
                                              selectedPrescription.diagnosis.map((d, i) => (
                                                  <Badge key={i} variant="outline">{d}</Badge>
                                              ))
                                          ) : <span className="text-muted-foreground italic">None recorded</span>}
                                      </div>
                                  </div>
                                  <div className="pt-2">
                                      <span className="font-medium text-muted-foreground text-xs uppercase">Complaints</span>
                                      <p className="mt-1">{selectedPrescription.complaints || "None"}</p>
                                  </div>
                                  <div className="pt-2">
                                      <span className="font-medium text-muted-foreground text-xs uppercase">Findings</span>
                                      {selectedPrescription.findings?.length ? (
                                          <ul className="list-disc list-inside mt-1">
                                              {selectedPrescription.findings.map((f, i) => (
                                                  <li key={i}>{f.title}: {f.description}</li>
                                              ))}
                                          </ul>
                                      ) : <p className="mt-1 text-muted-foreground italic">None</p>}
                                  </div>
                              </div>
                          </div>

                          {/* Vitals */}
                          <div className="border p-4 rounded-lg">
                              <h3 className="font-semibold mb-2 flex items-center gap-2">
                                  <Activity className="h-4 w-4" /> Vitals
                              </h3>
                              {selectedPrescription.vitals ? (
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                      {Object.entries(selectedPrescription.vitals).map(([k, v]) => (
                                          <div key={k}>
                                              <span className="text-muted-foreground capitalize">{k.replace('_', ' ')}:</span>
                                              <span className="font-medium ml-2">{v || "N/A"}</span>
                                          </div>
                                      ))}
                                  </div>
                              ) : <p className="text-sm text-muted-foreground italic">No vitals recorded.</p>}
                          </div>
                      </div>

                      <div className="space-y-4">
                           {/* Medicines */}
                           <div className="border p-4 rounded-lg">
                              <h3 className="font-semibold mb-2 flex items-center gap-2">
                                  <Pill className="h-4 w-4" /> Medicines
                              </h3>
                              <div className="space-y-3">
                                  {selectedPrescription.medicines.map((m, i) => (
                                      <div key={i} className="flex justify-between items-start text-sm border-b last:border-0 pb-2 last:pb-0">
                                          <div>
                                              <p className="font-medium">{m.name}</p>
                                              <p className="text-muted-foreground text-xs">{m.dosage} • {m.frequency} • {m.duration}</p>
                                          </div>
                                          <Badge>{m.quantity || 1}</Badge>
                                      </div>
                                  ))}
                              </div>
                          </div>

                           {/* Notes & Attachments */}
                           <div className="border p-4 rounded-lg">
                               <h3 className="font-semibold mb-2 text-sm">Notes</h3>
                               <p className="text-sm text-muted-foreground">{selectedPrescription.notes || "No notes."}</p>
                           </div>

                           <Button className="w-full mt-4" onClick={() => handleReviewDispense(selectedPrescription)}>
                               <DollarSign className="h-4 w-4 mr-2" /> Dispense & Invoice
                           </Button>
                      </div>
                  </div>
              )}
          </DialogContent>
      </Dialog>
      
      {/* Create Invoice Modal -> Now "Dispense Review" */}
       <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
          <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                  <DialogTitle>Confirm Dispense & Invoice</DialogTitle>
                  <DialogDescription>
                      Review calculated amounts before dispensing.
                  </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                  {calculatingInvoice ? (
                       <div className="flex flex-col items-center justify-center p-8 space-y-2">
                           <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                           <p className="text-sm text-muted-foreground">Fetching prices from inventory...</p>
                       </div>
                  ) : (
                      <div className="space-y-4">
                          <div className="border rounded-md overflow-hidden">
                              <table className="w-full text-sm">
                                  <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                                      <tr>
                                          <th className="px-3 py-2 text-left font-medium">Item</th>
                                          <th className="px-3 py-2 text-right font-medium">Qty</th>
                                          <th className="px-3 py-2 text-right font-medium">Price</th>
                                          <th className="px-3 py-2 text-right font-medium">Total</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {invoiceLines.map((line, i) => (
                                          <tr key={i} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                              <td className="px-3 py-2">
                                                  <span>{line.name}</span>
                                                  {!line.found && <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">Price not found</span>}
                                              </td>
                                              <td className="px-3 py-2 text-right">{line.quantity}</td>
                                              <td className="px-3 py-2 text-right text-muted-foreground">{line.unitPrice.toFixed(2)}</td>
                                              <td className="px-3 py-2 text-right font-medium">{line.total.toFixed(2)}</td>
                                          </tr>
                                      ))}
                                      {invoiceLines.length === 0 && (
                                          <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No medicines in prescription</td></tr>
                                      )}
                                  </tbody>
                                  <tfoot className="bg-slate-50 dark:bg-slate-900 border-t font-semibold">
                                      <tr>
                                          <td colSpan={3} className="px-3 py-2 text-right">Total Amount</td>
                                          <td className="px-3 py-2 text-right">{invoiceAmount}</td>
                                      </tr>
                                  </tfoot>
                              </table>
                          </div>
                          
                          <div className="flex items-center gap-4 justify-end">
                              <Label htmlFor="amount" className="whitespace-nowrap">Override Total:</Label>
                              <Input 
                                  id="amount" 
                                  type="number"
                                  value={invoiceAmount} 
                                  onChange={(e) => setInvoiceAmount(e.target.value)}
                                  className="w-32 text-right" 
                                  placeholder="0.00"
                                  disabled
                              />
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            * Total override disabled in this mode (auto-calculated by backend).
                          </p>
                      </div>
                  )}
              </div>

              <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsInvoiceOpen(false)}>Cancel</Button>
                  <Button onClick={handleConfirmDispense} disabled={creatingInvoice || calculatingInvoice || !invoiceAmount}>
                      {creatingInvoice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Dispense
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

      {/* Patient History Details Modal (Existing) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Patient History</DialogTitle>
                <DialogDescription>Review patient history and details.</DialogDescription>
            </DialogHeader>
            {loadingPatient ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : patientDetails ? (
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div>
                            <Label className="text-xs text-muted-foreground">Name</Label>
                            <p className="font-medium">{patientDetails.name || patientDetails.User?.username}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Email</Label>
                            <p className="font-medium">{patientDetails.User?.email || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Contact</Label>
                            <p className="font-medium">{patientDetails.contact_info || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">DOB</Label>
                            <p className="font-medium">{formatDate(patientDetails.dob)}</p>
                        </div>
                    </div>

                    {/* Prescription History */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Recent History
                        </h3>
                        <div className="space-y-3">
                            {(patientDetails.Appointments || []).map((apt: Appointment) => (
                                <div key={apt.id} className="border rounded-md p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-sm">Appointment on {formatDate(apt.date)}</span>
                                        <Badge variant="outline" className="text-xs">{apt.status}</Badge>
                                    </div>
                                    {(apt.Prescriptions || []).map((rx: Prescription) => (
                                        <div key={rx.id} className="border p-2 rounded text-sm mt-2">
                                            <div className="font-semibold text-xs mb-1 text-muted-foreground">RX-{rx.id} - {rx.status}</div>
                                            <div className="flex flex-wrap gap-1">
                                                {(rx.medicines || []).map((m: Medicine, idx: number) => (
                                                    <span key={idx} className="bg-white dark:bg-slate-800 px-2 py-1 rounded border text-xs">
                                                        {m.name} ({m.quantity || 1})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(apt.Prescriptions || []).length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">No prescriptions recorded for this visit.</p>
                                    )}
                                </div>
                            ))}
                            {(patientDetails.Appointments || []).length === 0 && (
                                <p className="text-muted-foreground text-sm">No appointment history found.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    Failed to load patient details.
                </div>
            )}
        </DialogContent>
      </Dialog>

      {/* Hidden Printable Invoice */}
      <div className="hidden">
           <div ref={invoiceRef} className="p-8 bg-white text-black print:block">
                <div className="flex justify-between items-start mb-8 border-b pb-4">
                     <div>
                         <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">Medical Invoice</h1>
                         <p className="text-sm text-gray-500">Invoice #{lastInvoiceId || "PENDING"}</p>
                         <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                         <h2 className="font-bold text-lg">Bajwa Hospital</h2>
                         <p className="text-sm text-gray-600">123 Hospital Road</p>
                         <p className="text-sm text-gray-600">City, State 12345</p>
                         <p className="text-sm text-gray-600">Ph: (555) 123-4567</p>
                     </div>
                </div>

                <div className="mb-8">
                     <h3 className="text-gray-600 text-xs uppercase font-semibold mb-2">Bill To</h3>
                     <p className="font-bold text-lg">{selectedPrescription?.Appointment?.patient?.name || "Patient"}</p>
                     <p className="text-sm text-gray-600">ID: {selectedPrescription?.Appointment?.patient_id || "N/A"}</p>
                     <p className="text-sm text-gray-600">{selectedPrescription?.Appointment?.patient?.contact_info}</p>
                </div>

                <table className="w-full mb-8">
                     <thead>
                         <tr className="border-b-2 border-gray-200">
                             <th className="text-left py-2 font-semibold">Description</th>
                             <th className="text-right py-2 font-semibold">Qty</th>
                             <th className="text-right py-2 font-semibold">Unit Price</th>
                             <th className="text-right py-2 font-semibold">Total</th>
                         </tr>
                     </thead>
                     <tbody>
                         {invoiceLines.map((line, i) => (
                             <tr key={i} className="border-b border-gray-100">
                                 <td className="py-2">{line.name}</td>
                                 <td className="text-right py-2">{line.quantity}</td>
                                 <td className="text-right py-2">${line.unitPrice.toFixed(2)}</td>
                                 <td className="text-right py-2">${line.total.toFixed(2)}</td>
                             </tr>
                         ))}
                     </tbody>
                     <tfoot>
                         <tr className="font-bold">
                             <td colSpan={3} className="text-right py-4">Total Amount:</td>
                             <td className="text-right py-4">${invoiceAmount}</td>
                         </tr>
                     </tfoot>
                </table>

                <div className="border-t pt-8 text-center text-sm text-gray-500">
                     <p>Thank you for choosing Bajwa Hospital.</p>
                     <p>This is a computer generated invoice.</p>
                </div>
           </div>
      </div>
    </div>
  )
}
