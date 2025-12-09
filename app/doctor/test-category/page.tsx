"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Check, X, Loader2, TestTube, ChevronDown, ChevronRight } from "lucide-react"
import { doctorService } from "@/lib/api/doctor"
import { TestCategory, TestDefinition } from "@/lib/api/types"

export default function TestCategoryManagement() {
    const [categories, setCategories] = useState<TestCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryCode, setNewCategoryCode] = useState("")
    const [newCategoryDesc, setNewCategoryDesc] = useState("")
    const [newLabType, setNewLabType] = useState("pathology")
    
    // Edit Category
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")
    const [editingCode, setEditingCode] = useState("")
    const [editingDesc, setEditingDesc] = useState("")
    const [editingLabType, setEditingLabType] = useState<"pathology" | "radiology" | "other">("pathology")

    // Expanded for definitions
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [newTestName, setNewTestName] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await doctorService.getTestCategories()
            setCategories(data)
        } catch (e) {
            console.error("Failed to load test categories", e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return
        try {
            setProcessing(true)
            await doctorService.addTestCategory({
                name: newCategoryName,
                code: newCategoryCode,
                description: newCategoryDesc,
                lab_type: newLabType
            })
            setNewCategoryName("")
            setNewCategoryCode("")
            setNewCategoryDesc("")
            setNewLabType("pathology")
            await loadData()
        } catch (e) {
            alert("Failed to add test category")
        } finally {
            setProcessing(false)
        }
    }

    const handleDeleteCategory = async (id: number) => {
        if (!confirm("Are you sure? This might delete all tests in this category.")) return
        try {
            setProcessing(true)
            await doctorService.deleteTestCategory(id)
            await loadData()
        } catch (e) {
            alert("Failed to delete test category")
        } finally {
            setProcessing(false)
        }
    }

    const handleUpdateCategory = async () => {
        if (!editingId || !editingName.trim()) return
        try {
            setProcessing(true)
            await doctorService.updateTestCategory(editingId, {
                name: editingName,
                code: editingCode,
                description: editingDesc,
                lab_type: editingLabType
            })
            setEditingId(null)
            await loadData()
        } catch (e) {
            alert("Failed to update test category")
        } finally {
            setProcessing(false)
        }
    }

    const handleAddTest = async (categoryId: number) => {
        if (!newTestName.trim()) return
        try {
            setProcessing(true)
            await doctorService.addTestDefinition(categoryId, newTestName)
            setNewTestName("")
            await loadData() // Reload to show new test in list
        } catch (e) {
            alert("Failed to add test")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400"/></div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Manage Test Categories</h1>
            
            {/* Add New Category Form */}
            <div className="p-5 bg-white dark:bg-slate-950 rounded-lg border shadow-sm space-y-4">
                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Create New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        className="p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                        placeholder="Category Name (e.g. Hematology)"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                    />
                    <input 
                        className="p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                        placeholder="Code (Optional, e.g. HEM)"
                        value={newCategoryCode}
                        onChange={e => setNewCategoryCode(e.target.value)}
                    />
                    <select 
                        className="p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                        value={newLabType}
                        onChange={e => setNewLabType(e.target.value)}
                    >
                        <option value="pathology">Pathology</option>
                        <option value="radiology">Radiology</option>
                        <option value="other">Other</option>
                    </select>
                     <input 
                        className="p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                        placeholder="Description (Optional)"
                        value={newCategoryDesc}
                        onChange={e => setNewCategoryDesc(e.target.value)}
                    />
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim() || processing}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {categories.length === 0 ? (
                     <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        No test categories found.
                    </div>
                ) : (
                    categories.map(cat => (
                        <div key={cat.id} className="border rounded-lg bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 border-b">
                                <div className="flex items-center gap-2 flex-1">
                                    <button onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}>
                                        {expandedId === cat.id ? <ChevronDown size={18} className="text-slate-500"/> : <ChevronRight size={18} className="text-slate-500"/>}
                                    </button>
                                    
                                    {editingId === cat.id ? (
                                        <div className="flex flex-col gap-2 flex-1 w-full">
                                            <div className="flex gap-2 items-center w-full">
                                                <input 
                                                    className="flex-1 p-1 border rounded text-sm"
                                                    value={editingName}
                                                    onChange={e => setEditingName(e.target.value)}
                                                    placeholder="Name"
                                                />
                                                <input 
                                                    className="w-24 p-1 border rounded text-sm"
                                                    value={editingCode}
                                                    onChange={e => setEditingCode(e.target.value)}
                                                    placeholder="Code"
                                                />
                                                <select 
                                                    className="p-1 border rounded text-sm"
                                                    value={editingLabType}
                                                    onChange={e => setNewLabType(e.target.value)}
                                                >
                                                    <option value="pathology">Pathology</option>
                                                    <option value="radiology">Radiology</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 items-center w-full">
                                                <input 
                                                    className="flex-1 p-1 border rounded text-sm"
                                                    value={editingDesc}
                                                    onChange={e => setEditingDesc(e.target.value)}
                                                    placeholder="Description"
                                                />
                                                <button onClick={handleUpdateCategory} disabled={processing} className="p-1 px-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={16}/></button>
                                                <button onClick={() => { setEditingId(null); setEditingName(""); setEditingCode(""); setEditingDesc(""); setEditingLabType("pathology"); }} className="p-1 px-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"><X size={16}/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{cat.name}</span>
                                            {cat.code && <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 font-mono">{cat.code}</span>}
                                            <span className="text-xs px-2 py-0.5 border rounded text-slate-500 uppercase">{cat.lab_type}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                     <button onClick={() => { 
                                         setEditingId(cat.id); 
                                         setEditingName(cat.name);
                                         setEditingCode(cat.code || "");
                                         setEditingDesc(cat.description || "");
                                         setEditingLabType(cat.lab_type || "pathology");
                                     }} className="p-1 text-slate-500 hover:text-blue-600">
                                        <Edit2 size={16}/>
                                     </button>
                                     <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-slate-500 hover:text-red-600">
                                        <Trash2 size={16}/>
                                     </button>
                                </div>
                            </div>

                            {expandedId === cat.id && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/20">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tests in this Category</h4>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {cat.TestDefinitions?.map(t => (
                                            <span key={t.id} className="px-2 py-1 bg-white dark:bg-slate-800 border rounded text-sm flex items-center gap-1">
                                                <TestTube size={12} className="text-teal-600"/>
                                                {t.name}
                                                {/* Could add delete test button here if API supported deleteTestDefinition */}
                                            </span>
                                        ))}
                                        {(!cat.TestDefinitions || cat.TestDefinitions.length === 0) && (
                                            <span className="text-sm text-slate-400 italic">No tests defined yet.</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 items-center max-w-md">
                                        <input 
                                            className="flex-1 p-2 text-sm border rounded"
                                            placeholder="New Test Name"
                                            value={newTestName}
                                            onChange={e => setNewTestName(e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleAddTest(cat.id)}
                                            disabled={!newTestName.trim() || processing}
                                            className="px-3 py-2 bg-slate-800 text-white rounded text-sm hover:bg-slate-700 disabled:opacity-50"
                                        >
                                            Add Test
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
