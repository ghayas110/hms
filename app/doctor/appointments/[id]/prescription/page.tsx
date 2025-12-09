"use client"

import { useEffect, useState, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clipboard, Activity, Stethoscope, Pill, TestTube, 
  FileText, Upload, DollarSign, ChevronRight, ChevronLeft, 
  Check, Plus, X, Search, Loader2, Download, Send 
} from "lucide-react"
import { doctorService } from "@/lib/api/doctor"
import { 
  Appointment, Medicine, SavedDiagnosis, MedicineGroup, 
  TestCategory, TestDefinition, CreatePrescriptionRequest,
  Finding, Vitals
} from "@/lib/api/types"
import { useReactToPrint } from "react-to-print"

// Step Definitions
const steps = [
  { id: 1, title: 'Complaints', icon: Clipboard },
  { id: 2, title: 'Findings', icon: Activity },
  { id: 3, title: 'Diagnosis', icon: Stethoscope },
  { id: 4, title: 'Vitals', icon: Activity },
  { id: 5, title: 'Medicines', icon: Pill },
  { id: 6, title: 'Tests', icon: TestTube },
  { id: 7, title: 'Attachments', icon: Upload },
  { id: 8, title: 'Notes', icon: FileText },
  { id: 9, title: 'Prescription', icon: FileText },
]

export default function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const prescriptionRef = useRef<HTMLDivElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  
  // Data for Selects
  const [diagnosesList, setDiagnosesList] = useState<SavedDiagnosis[]>([])
  const [medicineGroups, setMedicineGroups] = useState<MedicineGroup[]>([])
  const [testCategories, setTestCategories] = useState<TestCategory[]>([])

  // Form State
  const [formData, setFormData] = useState<CreatePrescriptionRequest>({
    appointment_id: parseInt(paramId),
    medicines: [],
    complaints: "",
    findings: [],
    diagnosis: [],
    vitals: {},
    test_orders: [],
    attachments: [],
    notes: ""
  })

  // Helper Inputs State
  const [newFinding, setNewFinding] = useState<Finding>({ title: "", description: "" })
  const [newMedicine, setNewMedicine] = useState<Medicine>({ name: "", dosage: "", frequency: "", duration: "" })
  const [selectedTestCategory, setSelectedTestCategory] = useState<string>("")

  useEffect(() => {
    // Determine the ID - handling params correctly in client component (params is a promise in Next 15+ but simple object in 14/earlier types usually)
    // Assuming Next.js App Router pattern:
    const id = parseInt(paramId)
    if (isNaN(id)) return // Handle invalid ID

    const init = async () => {
        try {
            // Fetch appointment details (and verify it's valid/today etc?)
            // Using getAppointments and finding it, or we need getAppointmentById?
            // doctorService.getAppointments returns lists. 
            // We'll trust the user or fetch all and find. 
            // Better: doctorService could have getAppointmentById. 
            // For now, we fetch all and filter (inefficient but works with existing API snippet)
            // Actually, we can assume the appointment exists if we got here.
            // Let's implement a 'getAppointmentById' helper if needed, or just fetch all.
            const apps = await doctorService.getAppointments()
            const app = apps.all.find(a => a.id === id)
            if (app) setAppointment(app)
            
            // Fetch Meta Data
            const [d, mg, tc] = await Promise.all([
                doctorService.getDiagnoses(),
                doctorService.getMedicineGroups(),
                doctorService.getTestCategories()
            ])
            setDiagnosesList(d)
            setMedicineGroups(mg)
            setTestCategories(tc)
            
        } catch (e) {
            console.error("Failed to load data", e)
        } finally {
            setLoading(false)
        }
    }
    init()
  }, [paramId])

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 9))
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    try {
        setSubmitting(true)
        await doctorService.createPrescription(formData)
        alert("Prescription created successfully and sent to pharmacy!")
        // Redirect to dashboard or success page
        router.push('/doctor')
    } catch (e) {
        console.error("Failed to submit prescription", e)
        alert("Failed to submit prescription")
    } finally {
        setSubmitting(false)
    }
  }

  const handleDownloadPDF = useReactToPrint({
    contentRef: prescriptionRef,
    documentTitle: `Prescription_${appointment?.patient?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}`
  })

  const handleSendToPharmacy = async () => {
    try {
        setSubmitting(true)
        await doctorService.createPrescription(formData)
        alert("Prescription sent to pharmacy successfully!")
        router.push('/doctor')
    } catch (e) {
        console.error("Failed to send to pharmacy", e)
        alert("Failed to send prescription to pharmacy")
    } finally {
        setSubmitting(false)
    }
  }

  const handleSendToLab = async () => {
    try {
        setSubmitting(true)
        await doctorService.createPrescription(formData)
        alert("Test orders sent to lab successfully!")
        router.push('/doctor')
    } catch (e) {
        console.error("Failed to send to lab", e)
        alert("Failed to send test orders to lab")
    } finally {
        setSubmitting(false)
    }
  }

  // Renderers for each step
  const renderStep = () => {
    switch (currentStep) {
        case 1: // Complaints
            return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <label className="block text-sm font-medium">Presenting Complaints</label>
                    <textarea 
                        className="w-full h-40 p-3 rounded-md border border-slate-200 dark:border-slate-800 dark:bg-slate-900" 
                        placeholder="Patient's main complaints..."
                        value={formData.complaints}
                        onChange={e => setFormData({...formData, complaints: e.target.value})}
                    />
                </div>
            )
        case 2: // Findings
            return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                     <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="text-xs">Finding Title</label>
                            <input 
                                className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                                value={newFinding.title}
                                onChange={e => setNewFinding({...newFinding, title: e.target.value})}
                                placeholder="e.g. Throat"
                            />
                        </div>
                        <div className="flex-[2]">
                            <label className="text-xs">Description</label>
                            <input 
                                className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                                value={newFinding.description}
                                onChange={e => setNewFinding({...newFinding, description: e.target.value})}
                                placeholder="Redness, inflammation..."
                            />
                        </div>
                        <button 
                            onClick={() => {
                                if (newFinding.title) {
                                    setFormData({...formData, findings: [...formData.findings, newFinding]})
                                    setNewFinding({title: "", description: ""})
                                }
                            }}
                            className="p-2 bg-teal-600 text-white rounded mb-[1px]"
                        >
                            <Plus size={20} />
                        </button>
                     </div>
                     
                     <div className="space-y-2 mt-4">
                        {formData.findings.map((f, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                                <div>
                                    <span className="font-semibold">{f.title}:</span> {f.description}
                                </div>
                                <button onClick={() => {
                                    const newF = [...formData.findings]
                                    newF.splice(i, 1)
                                    setFormData({...formData, findings: newF})
                                }} className="text-red-500"><X size={16}/></button>
                            </div>
                        ))}
                     </div>
                </div>
            )
        case 3: // Diagnosis
            return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex gap-2">
                         <select 
                            className="flex-1 p-2 rounded border border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                            onChange={e => {
                                if (e.target.value && !formData.diagnosis.includes(e.target.value)) {
                                    setFormData({...formData, diagnosis: [...formData.diagnosis, e.target.value]})
                                }
                            }}
                            value=""
                         >
                            <option value="">Select Saved Diagnosis</option>
                            {diagnosesList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                         </select>
                         {/* Manual Add Input could go here if requirement allows adding new on fly, req said "Select from saved... doctor can manage diagnosis list". We can assume management is elsewhere or inline. Let's add simple inline add for convenience */}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                        {formData.diagnosis.map((d, i) => (
                            <span key={i} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full flex items-center gap-2">
                                {d}
                                <button onClick={() => {
                                     const newD = [...formData.diagnosis]
                                     newD.splice(i, 1)
                                     setFormData({...formData, diagnosis: newD})
                                }}><X size={14}/></button>
                            </span>
                        ))}
                    </div>
                </div>
            )
        case 4: // Vitals
             return (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4">
                    {['Pulse Rate', 'Temperature', 'Blood Pressure', 'Blood Sugar', 'Height', 'Weight'].map(vital => {
                        const key = vital.toLowerCase().replace(' ', '_') as keyof Vitals
                        return (
                            <div key={key}>
                                <label className="text-sm font-medium">{vital}</label>
                                <input 
                                    className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                                    value={formData.vitals[key] || ""}
                                    onChange={e => setFormData({
                                        ...formData, 
                                        vitals: {...formData.vitals, [key]: e.target.value}
                                    })}
                                />
                            </div>
                        )
                    })}
                </div>
             )
        case 5: // Medicines
             return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded">
                        <span className="text-sm font-medium">Load Group:</span>
                        <div className="flex gap-2">
                            {medicineGroups.map(g => (
                                <button 
                                    key={g.id}
                                    onClick={() => {
                                        // Merge medicines
                                        setFormData({
                                            ...formData, 
                                            medicines: [...formData.medicines, ...g.medicines]
                                        })
                                    }}
                                    className="px-3 py-1 bg-white dark:bg-slate-800 border rounded text-xs hover:bg-slate-50"
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 items-end border p-4 rounded-lg">
                        <div className="col-span-2">
                            <label className="text-xs">Medicine Name</label>
                            <input 
                                className="w-full p-2 border rounded" 
                                value={newMedicine.name}
                                onChange={e => setNewMedicine({...newMedicine, name: e.target.value})}
                                placeholder="Paracetamol"
                            />
                        </div>
                        <div>
                             <label className="text-xs">Dosage</label>
                             <input 
                                className="w-full p-2 border rounded"
                                value={newMedicine.dosage}
                                onChange={e => setNewMedicine({...newMedicine, dosage: e.target.value})}
                                placeholder="500mg"
                             />
                        </div>
                         <div>
                             <label className="text-xs">Freq</label>
                             <input 
                                className="w-full p-2 border rounded"
                                value={newMedicine.frequency}
                                onChange={e => setNewMedicine({...newMedicine, frequency: e.target.value})}
                                placeholder="1-0-1"
                             />
                        </div>
                        <button 
                             onClick={() => {
                                 if (newMedicine.name) {
                                     setFormData({...formData, medicines: [...formData.medicines, newMedicine]})
                                     setNewMedicine({name:"", dosage:"", frequency:"", duration:""})
                                 }
                             }}
                            className="p-2 bg-teal-600 text-white rounded mb-[1px]"
                        >
                            <Plus size={20}/>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {formData.medicines.map((m, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-slate-950 border rounded shadow-sm">
                                <div>
                                    <div className="font-medium">{m.name}</div>
                                    <div className="text-xs text-slate-500">{m.dosage} | {m.frequency} | {m.duration}</div>
                                </div>
                                <button onClick={() => {
                                     const newM = [...formData.medicines]
                                     newM.splice(i, 1)
                                     setFormData({...formData, medicines: newM})
                                }} className="text-red-500"><X size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
             )
        case 6: // Tests
             return (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                     <div>
                         <label className="text-sm font-medium mb-2 block">Select Category</label>
                         <div className="flex flex-wrap gap-2 mb-4">
                            {testCategories.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedTestCategory(c.id.toString())}
                                    className={`px-3 py-1 rounded-full text-sm border ${
                                        selectedTestCategory === c.id.toString() 
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'bg-white dark:bg-slate-900 border-slate-200'
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                         </div>
                         
                         {selectedTestCategory && (
                             <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
                                 {testCategories.find(c => c.id.toString() === selectedTestCategory)?.TestDefinitions?.map(t => (
                                     <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer">
                                         <input 
                                            type="checkbox"
                                            checked={formData.test_orders.includes(t.name)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setFormData({...formData, test_orders: [...formData.test_orders, t.name]})
                                                } else {
                                                    setFormData({...formData, test_orders: formData.test_orders.filter(xn => xn !== t.name)})
                                                }
                                            }}
                                         />
                                         <span className="text-sm">{t.name}</span>
                                     </label>
                                 ))}
                             </div>
                         )}
                     </div>
                     
                     <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Selected Tests:</h4>
                        <ul className="list-disc pl-5 text-sm">
                            {formData.test_orders.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                     </div>
                 </div>
             )
        case 7: // Attachments
             return (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg animate-in fade-in slide-in-from-right-4">
                    <CloudUpload className="h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Drag & drop files here or click to upload</p>
                    <input type="file" className="hidden" id="file-upload" multiple />
                    <label htmlFor="file-upload" className="mt-4 px-4 py-2 bg-white border rounded cursor-pointer hover:bg-slate-50 text-sm">
                        Select Files
                    </label>
                    <div className="mt-4 w-full text-sm text-slate-500">
                         {/* Mock file list */}
                         <p>No files uploaded (Functionality mocked)</p>
                    </div>
                </div>
             )
        case 8: // Notes
             return (
                 <div className="animate-in fade-in slide-in-from-right-4">
                      <label className="block text-sm font-medium mb-2">Notes for Patient</label>
                    <textarea 
                        className="w-full h-40 p-3 rounded-md border border-slate-200 dark:border-slate-800 dark:bg-slate-900" 
                        placeholder="Instructions, diet plan, follow-up..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                 </div>
             )
        case 9: // Prescription Preview
             return (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                     <div ref={prescriptionRef} id="prescription-preview" className="border rounded-lg p-8 bg-white dark:bg-slate-950 shadow-sm max-w-3xl mx-auto print:shadow-none print:border-0">
                         {/* Header */}
                         <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-teal-600">
                             <div>
                                 <h2 className="text-3xl font-bold text-teal-700">PRESCRIPTION</h2>
                                 <p className="text-sm text-slate-500 mt-1">Rx #{appointment?.id}</p>
                             </div>
                             <div className="text-right">
                                 <h3 className="font-bold text-lg">HMS Clinic</h3>
                                 <p className="text-xs text-slate-600">123 Health Ave</p>
                                 <p className="text-xs text-slate-600">Phone: (555) 123-4567</p>
                             </div>
                         </div>
                         
                         {/* Patient & Doctor Info */}
                         <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b">
                             <div>
                                 <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Patient</p>
                                 <p className="font-semibold text-lg">{appointment?.patient?.name || appointment?.patient?.User?.username || "Patient"}</p>
                                 <p className="text-sm text-slate-600">{appointment?.patient?.gender || ""}</p>
                                 <p className="text-sm text-slate-600">{appointment?.patient?.contact_info || ""}</p>
                             </div>
                             <div className="text-right">
                                 <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Date</p>
                                 <p className="font-semibold text-lg">{new Date().toLocaleDateString()}</p>
                                 <p className="text-sm text-slate-600 mt-2">Dr. {appointment?.doctor?.User?.username || "Doctor"}</p>
                                 <p className="text-xs text-slate-500">{appointment?.doctor?.specialization || ""}</p>
                             </div>
                         </div>
                         
                         {/* Complaints */}
                         {formData.complaints && (
                             <div className="mb-4">
                                 <h4 className="font-semibold text-sm text-teal-700 mb-2 flex items-center gap-2">
                                     <Clipboard size={16} /> Chief Complaints
                                 </h4>
                                 <p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded">{formData.complaints}</p>
                             </div>
                         )}
                         
                         {/* Vitals */}
                         {Object.keys(formData.vitals).length > 0 && (
                             <div className="mb-4">
                                 <h4 className="font-semibold text-sm text-teal-700 mb-2 flex items-center gap-2">
                                     <Activity size={16} /> Vitals
                                 </h4>
                                 <div className="grid grid-cols-3 gap-2 text-xs">
                                     {formData.vitals.pulse_rate && (
                                         <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                             <span className="text-slate-500">Pulse:</span> <span className="font-medium">{formData.vitals.pulse_rate}</span>
                                         </div>
                                     )}
                                     {formData.vitals.temperature && (
                                         <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                             <span className="text-slate-500">Temp:</span> <span className="font-medium">{formData.vitals.temperature}</span>
                                         </div>
                                     )}
                                     {formData.vitals.blood_pressure && (
                                         <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                             <span className="text-slate-500">BP:</span> <span className="font-medium">{formData.vitals.blood_pressure}</span>
                                         </div>
                                     )}
                                     {formData.vitals.blood_sugar && (
                                         <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                             <span className="text-slate-500">Sugar:</span> <span className="font-medium">{formData.vitals.blood_sugar}</span>
                                         </div>
                                     )}
                                     {formData.vitals.height && (
                                         <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                             <span className="text-slate-500">Height:</span> <span className="font-medium">{formData.vitals.height}</span>
                                         </div>
                                     )}
                                     {formData.vitals.weight && (
                                         <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                             <span className="text-slate-500">Weight:</span> <span className="font-medium">{formData.vitals.weight}</span>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )}
                         
                         {/* Diagnosis */}
                         {formData.diagnosis.length > 0 && (
                             <div className="mb-4">
                                 <h4 className="font-semibold text-sm text-teal-700 mb-2 flex items-center gap-2">
                                     <Stethoscope size={16} /> Diagnosis
                                 </h4>
                                 <div className="flex flex-wrap gap-2">
                                     {formData.diagnosis.map((d, i) => (
                                         <span key={i} className="px-3 py-1 bg-teal-50 text-teal-800 dark:bg-teal-900 dark:text-teal-100 rounded-full text-xs font-medium">
                                             {d}
                                         </span>
                                     ))}
                                 </div>
                             </div>
                         )}
                         
                         {/* Medicines */}
                         {formData.medicines.length > 0 && (
                             <div className="mb-4">
                                 <h4 className="font-semibold text-sm text-teal-700 mb-2 flex items-center gap-2">
                                     <Pill size={16} /> Medicines
                                 </h4>
                                 <div className="space-y-2">
                                     {formData.medicines.map((m, i) => (
                                         <div key={i} className="border-l-2 border-teal-600 pl-3 py-1">
                                             <p className="font-medium text-sm">{i + 1}. {m.name}</p>
                                             <p className="text-xs text-slate-600">
                                                 {m.dosage} | {m.frequency} | {m.duration}
                                             </p>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                         
                         {/* Test Orders */}
                         {formData.test_orders.length > 0 && (
                             <div className="mb-4">
                                 <h4 className="font-semibold text-sm text-teal-700 mb-2 flex items-center gap-2">
                                     <TestTube size={16} /> Laboratory Tests
                                 </h4>
                                 <ul className="list-disc list-inside text-sm space-y-1">
                                     {formData.test_orders.map((t, i) => (
                                         <li key={i} className="text-slate-700 dark:text-slate-300">{t}</li>
                                     ))}
                                 </ul>
                             </div>
                         )}
                         
                         {/* Notes */}
                         {formData.notes && (
                             <div className="mb-4">
                                 <h4 className="font-semibold text-sm text-teal-700 mb-2 flex items-center gap-2">
                                     <FileText size={16} /> Notes / Instructions
                                 </h4>
                                 <p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded">{formData.notes}</p>
                             </div>
                         )}
                         
                         {/* Footer */}
                         <div className="mt-8 pt-4 border-t text-center">
                             <div className="text-xs text-slate-400">
                                 Generated by HMS - Hospital Management System
                             </div>
                             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 print:block hidden">
                                 <p className="text-xs text-slate-500">Doctor's Signature: _______________________</p>
                             </div>
                         </div>
                     </div>
                 </div>
             )
    }
  }
  
  // Icon helper
  const CloudUpload = Upload; // Fix for reference in step 7

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-950">
        <div>
            <h1 className="text-lg font-bold">New Prescription</h1>
            <p className="text-xs text-slate-500">Patient: {appointment?.patient?.name || appointment?.patient?.User?.username}</p>
        </div>
        <div className="flex gap-2 text-sm text-slate-500">
             Step {currentStep} of 9
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Steps */}
          <div className="w-64 border-r bg-slate-50 dark:bg-slate-900 p-4 space-y-1 overflow-y-auto hidden md:block">
              {steps.map(s => {
                  const Icon = s.icon
                  const active = s.id === currentStep
                  const passed = s.id < currentStep
                  return (
                      <button
                        key={s.id}
                        onClick={() => setCurrentStep(s.id)}
                        className={`w-full flex items-center gap-3 p-3 text-sm rounded-lg transition-colors ${
                            active ? 'bg-teal-100 text-teal-900 font-medium' : 
                            passed ? 'text-teal-600' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                          <div className={`p-1.5 rounded-full ${active ? 'bg-teal-200' : passed ? 'bg-teal-50' : 'bg-slate-200'} `}>
                            {passed ? <Check size={12}/> : <Icon size={12}/>}
                          </div>
                          {s.title}
                      </button>
                  )
              })}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 relative">
             <div className="max-w-3xl mx-auto pb-20">
                 <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    {(() => {
                        const Icon = steps.find(s => s.id === currentStep)?.icon || Activity
                        return <Icon className="text-teal-600" />
                    })()}
                    {steps.find(s => s.id === currentStep)?.title}
                 </h2>
                 {renderStep()}
             </div>
          </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t p-4 bg-white dark:bg-slate-950 flex justify-between items-center">
          <button 
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 border rounded hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
          >
              <ChevronLeft size={16}/> Back
          </button>

          {currentStep === 9 ? (
             <div className="flex gap-2 print:hidden">
                <button 
                   onClick={handleSendToPharmacy}
                   disabled={submitting}
                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                   {submitting && <Loader2 className="animate-spin" size={16}/>}
                   <Send size={16}/> Send to Pharmacy
                </button>
                <button 
                   onClick={handleSendToLab}
                   disabled={submitting || formData.test_orders.length === 0}
                   className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                   {submitting && <Loader2 className="animate-spin" size={16}/>}
                   <Send size={16}/> Send to Lab
                </button>
                <button 
                   onClick={handleDownloadPDF}
                   className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 flex items-center gap-2"
                >
                   <Download size={16}/> Download as PDF
                </button>
             </div>
          ) : (
            <button 
                onClick={handleNext}
                className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-2"
            >
                Next <ChevronRight size={16}/>
            </button>
          )}
      </div>
    </div>
  )
}
