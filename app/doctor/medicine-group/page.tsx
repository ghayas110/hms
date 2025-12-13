"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Check, X, Loader2, Pill } from "lucide-react"
import { doctorService } from "@/lib/api/doctor"
import { MedicineGroup, Medicine } from "@/lib/api/types"
import { MedicineAutocomplete } from "@/components/ui/medicine-autocomplete"

const safeParseArray = <T,>(data: any): T[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
    return []
}

export default function MedicineGroupManagement() {
    const [groups, setGroups] = useState<MedicineGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    
    // Add New Group State
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [newGroupName, setNewGroupName] = useState("")
    const [newGroupMedicines, setNewGroupMedicines] = useState<Medicine[]>([])
    
    const [tempMedicine, setTempMedicine] = useState<Medicine>({
        name: "", dosage: "", frequency: "", duration: ""
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await doctorService.getMedicineGroups()
            setGroups(data)
        } catch (e) {
            console.error("Failed to load medicine groups", e)
        } finally {
            setLoading(false)
        }
    }

    const addMedicineToNewGroup = () => {
        if (!tempMedicine.name) return
        setNewGroupMedicines([...newGroupMedicines, tempMedicine])
        setTempMedicine({ name: "", dosage: "", frequency: "", duration: "" })
    }

    const removeMedicineFromNewGroup = (index: number) => {
        const updated = [...newGroupMedicines]
        updated.splice(index, 1)
        setNewGroupMedicines(updated)
    }

    const handleSaveGroup = async () => {
        if (!newGroupName.trim()) return
        try {
            setProcessing(true)
            if (editingId) {
                await doctorService.updateMedicineGroup(editingId, { name: newGroupName, medicines: newGroupMedicines })
            } else {
                await doctorService.addMedicineGroup(newGroupName, newGroupMedicines)
            }
            
            setShowAddForm(false)
            setEditingId(null)
            setNewGroupName("")
            setNewGroupMedicines([])
            await loadData()
        } catch (e: any) {
            // Handle 404 gracefully - maybe it was already deleted by someone else
            if (e.response && e.response.status === 404) {
                alert("This group no longer exists. It may have been deleted already.")
                setShowAddForm(false)
                setEditingId(null)
                await loadData()
                return
            }
            console.error(e)
            alert("Failed to save medicine group")
        } finally {
            setProcessing(false)
        }
    }

    const handleEdit = (group: MedicineGroup) => {
        setEditingId(group.id)
        setNewGroupName(group.name)
        setNewGroupMedicines(safeParseArray(group.medicines))
        setShowAddForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this group?")) return
        try {
            await doctorService.deleteMedicineGroup(id)
            await loadData()
        } catch (e: any) {
            if (e.response && e.response.status === 404) {
                 // Already deleted, just clean up local state
                 await loadData()
                 return
            }
            console.error(e)
            alert("Failed to delete medicine group")
        }
    }
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Manage Medicine Groups</h1>
            
            {!showAddForm ? (
                <button 
                    onClick={() => {
                        setEditingId(null)
                        setNewGroupName("")
                        setNewGroupMedicines([])
                        setShowAddForm(true)
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2"
                >
                    <Plus size={16} /> Create New Group
                </button>
            ) : (
                <div className="p-4 border rounded-lg bg-white dark:bg-slate-950 space-y-4 shadow-sm">
                    <h3 className="font-semibold">{editingId ? 'Edit Medicine Group' : 'New Medicine Group'}</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Group Name</label>
                        <input 
                            className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-800"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="e.g. Fever Treatment"
                        />
                    </div>
                    
                    <div className="border p-3 rounded bg-slate-50 dark:bg-slate-900/50">
                        <label className="block text-sm font-medium mb-2">Add Medicines</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                            <MedicineAutocomplete 
                                className="w-full text-sm"
                                value={tempMedicine.name} 
                                onChange={val => setTempMedicine({...tempMedicine, name: val})}
                                onSelect={(item) => setTempMedicine({...tempMedicine, name: item.medicine_name})}
                                placeholder="Name"
                            />
                            <input className="p-2 border rounded text-sm w-full" placeholder="Dosage" value={tempMedicine.dosage} onChange={e => setTempMedicine({...tempMedicine, dosage: e.target.value})}/>
                            <input className="p-2 border rounded text-sm w-full" placeholder="Freq" value={tempMedicine.frequency} onChange={e => setTempMedicine({...tempMedicine, frequency: e.target.value})}/>
                            <div className="flex gap-1">
                                <input className="p-2 border rounded text-sm flex-1 w-full" placeholder="Dur" value={tempMedicine.duration} onChange={e => setTempMedicine({...tempMedicine, duration: e.target.value})}/>
                                <button onClick={addMedicineToNewGroup} className="p-2 bg-teal-600 text-white rounded shrink-0"><Plus size={16}/></button>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            {safeParseArray<Medicine>(newGroupMedicines).map((m, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-slate-950 border rounded">
                                    <span>{m.name} - {m.dosage} - {m.frequency} ({m.duration})</span>
                                    <button onClick={() => removeMedicineFromNewGroup(i)} className="text-red-500"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button onClick={() => {
                            setShowAddForm(false)
                            setEditingId(null)
                            setNewGroupName("")
                            setNewGroupMedicines([])
                        }} className="px-4 py-2 border rounded hover:bg-slate-50">Cancel</button>
                        <button onClick={handleSaveGroup} disabled={processing || !newGroupName} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
                            {editingId ? 'Update Group' : 'Save Group'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                 {loading ? <Loader2 className="animate-spin text-slate-400 mx-auto"/> : groups.length === 0 ? (
                    <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        No medicine groups found.
                    </div>
                ) : (
                    groups.map(g => (
                        <div key={g.id} className="border rounded-lg p-4 bg-white dark:bg-slate-950 shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Pill size={18} className="text-teal-600"/>
                                    {g.name}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(g)} className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded">
                                        <Edit2 size={16}/>
                                    </button>
                                    <button onClick={() => handleDelete(g.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {safeParseArray<Medicine>(g.medicines).map((m: Medicine, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded border">
                                        {m.name} ({m.dosage})
                                    </span>
                                ))}
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
