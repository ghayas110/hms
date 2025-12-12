"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Receipt, Users, TrendingUp, Plus, Loader2, CreditCard, Banknote, X, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { billingService } from "@/lib/api/billing"
import { Invoice, Appointment, InvoiceService } from "@/lib/api/types"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString()
}

interface EnrichedAppointment extends Appointment {
    patient_name: string;
    doctor_name: string;
}

export default function CounterBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  // ... (keep state same)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [pageLimit] = useState(10)
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  
  // Create Invoice State
  const [consultationFee, setConsultationFee] = useState("0")
  const [otherCharges, setOtherCharges] = useState<{name: string, amount: string}[]>([{name: "", amount: ""}])

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paymentAmount, setPaymentAmount] = useState("") // Should match invoice amount usually


  useEffect(() => {
    loadData()
  }, [currentPage, searchQuery])

  const loadData = async () => {
    setLoading(true)
    try {
      try {
        const invoicesResponse = await billingService.getAllInvoices({
          page: currentPage,
          limit: pageLimit,
          search: searchQuery
        })
        
        setInvoices(invoicesResponse.data?.map((i: Invoice) => ({
             ...i,
             created_at: i.createdAt || i.created_at, // Handle potential casing diff
             doctor_name: i.Appointment?.Doctor?.User?.username || (i.Appointment ? "Unknown" : undefined)
        })) || [])
        setTotalInvoices(invoicesResponse.total || 0)
        setTotalPages(invoicesResponse.totalPages || 1)
      } catch (e) {
        console.error("Failed to load invoices", e)
      }

      try {
        const appointmentsData = await billingService.getAppointments()
        setAppointments(appointmentsData?.map((a: Appointment) => ({
            ...a,
            patient_name: a.Patient?.name || a.Patient?.User?.username || "Unknown",
            doctor_name: a.Doctor?.User?.username || "Unknown"
        })) || [])
      } catch (e) {
        console.error("Failed to load appointments", e)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleSearchClear = () => {
    setSearchInput("")
    setSearchQuery("")
    setCurrentPage(1)
  }


  const handleCreateInvoice = async () => {
    if (!selectedAppointment) return

    try {
        const services = [
            { name: "Consultation Fee", amount: parseFloat(consultationFee) || 0 },
            ...otherCharges.filter(c => c.name && c.amount).map(c => ({
                name: c.name,
                amount: parseFloat(c.amount) || 0
            }))
        ]
        
        const totalAmount = services.reduce((sum, s) => sum + s.amount, 0)

        await billingService.createInvoice({
            appointment_id: selectedAppointment.id,
            patient_id: selectedAppointment.patient_id,
            services,
            amount: totalAmount,
            payment_method: "Cash" // Default for now
        })
        
        setShowCreateDialog(false)
        setSelectedAppointment(null)
        setConsultationFee("0")
        setOtherCharges([{name: "", amount: ""}])
        await loadData()
    } catch (e) {
        alert("Failed to create invoice")
    }
  }

  const handleProcessPaymentClick = (invoice: Invoice) => {
    setPaymentInvoice(invoice)
    setPaymentAmount(invoice.amount.toString()) // Pre-fill with invoice amount
    setPaymentMethod("Cash")
    setShowPaymentModal(true)
  }

  const handleSubmitPayment = async () => {
    if (!paymentInvoice) return

    try {
        setProcessingId(paymentInvoice.id)
        await billingService.processPayment(
            paymentInvoice.id, 
            paymentMethod, 
            parseFloat(paymentAmount)
        )
        setShowPaymentModal(false)
        setPaymentInvoice(null)
        await loadData()
    } catch (e) {
        alert("Failed to process payment")
    } finally {
        setProcessingId(null)
    }
  }

  const handlePrintInvoice = (invoice: Invoice) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(22)
    doc.text("Medical Center Invoice", 105, 20, { align: "center" })
    
    doc.setFontSize(12)
    doc.text(`Invoice #${invoice.id}`, 20, 40)
    doc.text(`Date: ${formatDate(invoice.created_at)}`, 20, 50)
    
    // Patient Details
    doc.text(`Patient ID: ${invoice.patient_id}`, 20, 70)
    if (invoice.appointment_id) {
         doc.text(`Appointment #${invoice.appointment_id}`, 20, 80)
    }

    // Table Header
    doc.line(20, 95, 190, 95)
    doc.text("Description", 20, 105)
    doc.text("Amount", 160, 105)
    doc.line(20, 110, 190, 110)

    // Items
    let y = 120
    const services = Array.isArray(invoice.services) && invoice.services.length > 0 ? invoice.services : [{ name: "Consultation Fee", amount: invoice.amount }]
    
    services.forEach((service: any) => {
        doc.text(service.name || "Service", 20, y)
        doc.text(`$${Number(service.amount).toFixed(2)}`, 160, y)
        y += 10
    })

    // Total
    doc.line(20, y, 190, y)
    y += 10
    doc.setFontSize(14)
    doc.text(`Total: $${Number(invoice.amount).toFixed(2)}`, 140, y)
    
    // Footer
    doc.setFontSize(10)
    doc.text("Thank you for choosing our services.", 105, 280, { align: "center" })

    doc.save(`invoice-${invoice.id}.pdf`)
  }
  
  // Update status checks to match new type lower case 'unpaid' and 'paid'
  const totalPending = invoices.filter(b => b.status === "unpaid").reduce((sum, b) => sum + Number(b.amount), 0)
  const totalPaid = invoices.filter(b => b.status === "paid").reduce((sum, b) => sum + Number(b.amount), 0)

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Billing & Invoices</h1>
        <Button onClick={() => setShowCreateDialog(true)}>Create New Invoice</Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice ID or patient name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        {searchQuery && (
          <Button variant="outline" onClick={handleSearchClear}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

       {showCreateDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Create Invoice</h2>
                            <button onClick={() => setShowCreateDialog(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20}/>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Appointment</label>
                                <select 
                                    className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-800"
                                    onChange={e => {
                                        const apt = appointments.find(a => a.id === parseInt(e.target.value))
                                        setSelectedAppointment(apt || null)
                                    }}
                                >
                                    <option value="">Select Appointment...</option>
                                    {appointments.filter(a => !invoices.some(i => i.appointment_id === a.id)).map(apt => (
                                        <option key={apt.id} value={apt.id}>
                                            {apt.patient_name} - {formatDate(apt.date)} ({apt.doctor_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedAppointment && (
                                <>
                                     <div>
                                        <label className="block text-sm font-medium mb-1">Consultation Fee</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-800"
                                            value={consultationFee}
                                            onChange={e => setConsultationFee(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Additional Charges</label>
                                        {otherCharges.map((charge, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input 
                                                    placeholder="Service Name" 
                                                    className="flex-1 p-2 border rounded dark:bg-slate-900 dark:border-slate-800"
                                                    value={charge.name}
                                                    onChange={e => {
                                                        const newCharges = [...otherCharges]
                                                        newCharges[i].name = e.target.value
                                                        setOtherCharges(newCharges)
                                                    }}
                                                />
                                                <input 
                                                    type="number"
                                                    placeholder="Amount" 
                                                    className="w-32 p-2 border rounded dark:bg-slate-900 dark:border-slate-800"
                                                    value={charge.amount}
                                                    onChange={e => {
                                                        const newCharges = [...otherCharges]
                                                        newCharges[i].amount = e.target.value
                                                        setOtherCharges(newCharges)
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <Button size="sm" variant="outline" onClick={() => setOtherCharges([...otherCharges, {name: "", amount: ""}])}>
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                        <Button onClick={handleCreateInvoice} className="bg-teal-600 hover:bg-teal-700">Generate Invoice</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showPaymentModal && paymentInvoice && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
                    <div className="p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Process Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20}/>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                <div className="text-sm text-slate-500">Amount Due</div>
                                <div className="text-2xl font-bold">${Number(paymentInvoice.amount).toFixed(2)}</div>
                                <div className="text-xs text-slate-500 mt-1">Invoice #{paymentInvoice.id}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Method</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Cash", "Card", "Online", "Insurance"].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                paymentMethod === method
                                                    ? "bg-teal-600 text-white"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                             <div>
                                <label className="block text-sm font-medium mb-1">Amount Given</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-800"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                />
                            </div>

                             <div className="pt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                                <Button onClick={handleSubmitPayment} className="bg-teal-600 hover:bg-teal-700" disabled={!!processingId}>
                                    {processingId ? <Loader2 className="animate-spin h-4 w-4"/> : "Confirm Payment"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(b => b.status === "unpaid").length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(b => b.status === "paid").length} payments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {loading ? <Loader2 className="animate-spin mx-auto"/> : invoices.length === 0 ? (
             <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-500">
                No invoices found
             </div>
        ) : invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Invoice #{invoice.id}</CardTitle>
                  <CardDescription className="space-y-1 mt-2">
                    <div>Issued: {formatDate(invoice.created_at || invoice.createdAt || "")}</div>
                    {invoice.appointment_id && (
                        <>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Appointment #{invoice.appointment_id}</span>
                              {invoice.Appointment?.date && (
                                <span>• {formatDate(invoice.Appointment.date)} at {invoice.Appointment.time}</span>
                              )}
                            </div>
                            {invoice.doctor_name && (
                              <div>Doctor: Dr. {invoice.doctor_name}</div>
                            )}
                            {invoice.Patient?.User?.username && (
                              <div>Patient: {invoice.Patient.User.username}</div>
                            )}
                        </>
                    )}
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}>
                  {invoice.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold mb-2 text-sm">Services</h4>
                  <div className="space-y-2">
                     {/* 
                        If services are stored as JSON in backend, they might be in invoice.services. 
                        Adjusting type/render based on assumption it's an array of objects.
                     */}
                    {(Array.isArray(invoice.services) && invoice.services.length > 0) ? invoice.services.map((service : InvoiceService, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{service.name}</span>
                        <span className="font-medium">${Number(service.amount).toFixed(2)}</span>
                      </div>
                    )) : (
                        <div className="flex justify-between text-sm">
                            <span>Consultation Fee</span>
                            <span className="font-medium">${Number(invoice.amount).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${Number(invoice.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {invoice.status === "unpaid" && (
                    <Button 
                        size="sm" 
                        onClick={() => handleProcessPaymentClick(invoice)}
                        disabled={processingId === invoice.id}
                    >
                        {processingId === invoice.id ? <Loader2 className="animate-spin h-4 w-4"/> : <CreditCard className="mr-2 h-4 w-4"/>}
                        Process Payment
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handlePrintInvoice(invoice)}>Print Invoice</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {invoices.length > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0} to {Math.min(currentPage * pageLimit, totalInvoices)} of {totalInvoices} invoices
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-teal-600 hover:bg-teal-700" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>

  )
}
