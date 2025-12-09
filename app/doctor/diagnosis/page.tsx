"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react"
import { doctorService } from "@/lib/api/doctor"
import { SavedDiagnosis } from "@/lib/api/types"

export default function DiagnosisManagement() {
    const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await doctorService.getDiagnoses()
            setDiagnoses(data)
        } catch (e) {
            console.error("Failed to load diagnoses", e)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!newName.trim()) return
        try {
            setProcessing(true)
            await doctorService.addDiagnosis(newName)
            setNewName("")
            await loadData()
        } catch (e) {
            alert("Failed to add diagnosis")
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this diagnosis?")) return
        try {
            setProcessing(true)
            await doctorService.deleteDiagnosis(id)
            await loadData()
        } catch (e) {
            alert("Failed to delete diagnosis")
        } finally {
            setProcessing(false)
        }
    }

    const startEdit = (d: SavedDiagnosis) => {
        setEditingId(d.id)
        setEditingName(d.name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName("")
    }

    const handleUpdate = async () => {
        if (!editingId || !editingName.trim()) return
        try {
            setProcessing(true)
            await doctorService.updateDiagnosis(editingId, editingName)
            setEditingId(null)
            await loadData()
        } catch (e) {
            alert("Failed to update diagnosis")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400"/></div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Manage Diagnoses</h1>
            
            <div className="flex gap-2 p-4 bg-white dark:bg-slate-950 rounded-lg border shadow-sm">
                <input 
                    className="flex-1 p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                    placeholder="Enter new diagnosis name..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                />
                <button 
                    onClick={handleAdd}
                    disabled={!newName.trim() || processing}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                    <Plus size={16} /> Add
                </button>
            </div>

            <div className="grid gap-2">
                {diagnoses.length === 0 ? (
                    <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        No saved diagnoses found.
                    </div>
                ) : (
                    diagnoses.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-950 border rounded-md shadow-sm">
                            {editingId === d.id ? (
                                <div className="flex flex-1 gap-2 items-center">
                                    <input 
                                        className="flex-1 p-1 border rounded dark:bg-slate-900 dark:border-slate-800"
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                    />
                                    <button onClick={handleUpdate} disabled={processing} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16}/></button>
                                    <button onClick={cancelEdit} disabled={processing} className="p-1 text-slate-500 hover:bg-slate-100 rounded"><X size={16}/></button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium">{d.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(d)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                                            <Edit2 size={16}/>
                                        </button>
                                        <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
