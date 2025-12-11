"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Check, X, Loader2, TestTube, ChevronDown, ChevronRight, Beaker } from "lucide-react"
import { labService } from "@/lib/api/lab"
import { TestCategory, TestDefinition, TestParameter } from "@/lib/api/types"

export default function TestManagementPage() {
    const [categories, setCategories] = useState<TestCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    
    // New Category State
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryCode, setNewCategoryCode] = useState("")
    const [newCategoryDesc, setNewCategoryDesc] = useState("")
    const [newLabType, setNewLabType] = useState("pathology")
    
    // Edit Category State
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")
    const [editingCode, setEditingCode] = useState("")
    const [editingDesc, setEditingDesc] = useState("")
    const [editingLabType, setEditingLabType] = useState<"pathology" | "radiology" | "other">("pathology")
    
    // State for Test Definition creation within a category
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null)
    const [newTestName, setNewTestName] = useState("")
    const [newTestParameters, setNewTestParameters] = useState<TestParameter[]>([])
    
    // State for temporary new parameter inputs
    const [paramName, setParamName] = useState("")
    const [paramUnit, setParamUnit] = useState("")
    const [paramMin, setParamMin] = useState("")
    const [paramMax, setParamMax] = useState("")
    
    // Edit Test State
    const [editingTestId, setEditingTestId] = useState<number | null>(null)
    const [editingTestName, setEditingTestName] = useState("")
    const [editingTestParameters, setEditingTestParameters] = useState<TestParameter[]>([])
    const [editingTestCategoryId, setEditingTestCategoryId] = useState<number | null>(null)

    // Temporary param state for editing
    const [editParamName, setEditParamName] = useState("")
    const [editParamUnit, setEditParamUnit] = useState("")
    const [editParamMin, setEditParamMin] = useState("")
    const [editParamMax, setEditParamMax] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await labService.getTestCategories()
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
            await labService.addTestCategory({
                name: newCategoryName,
                code: newCategoryCode,
                description: newCategoryDesc,
                lab_type: newLabType as any
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
            await labService.deleteTestCategory(id)
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
            await labService.updateTestCategory(editingId, {
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

    const addParameterToTest = () => {
        if (!paramName.trim()) return;
        setNewTestParameters([
            ...newTestParameters,
            {
                name: paramName,
                unit: paramUnit,
                normal_range_min: paramMin,
                normal_range_max: paramMax,
                type: 'number' 
            }
        ])
        setParamName("")
        setParamUnit("")
        setParamMin("")
        setParamMax("")
    }

    const removeParameterFromTest = (index: number) => {
        setNewTestParameters(newTestParameters.filter((_, i) => i !== index))
    }

    const handleAddTestDefinition = async (categoryId: number) => {
        if (!newTestName.trim()) return
        try {
            setProcessing(true)
            await labService.addTestDefinition(categoryId, newTestName, newTestParameters)
            setNewTestName("")
            setNewTestParameters([])
            await loadData()
        } catch (e) {
            alert("Failed to add test definition")
        } finally {
            setProcessing(false)
        }
    }

    // Edit Test Functions
    const addParameterToEditTest = () => {
        if (!editParamName.trim()) return;
        setEditingTestParameters([
            ...editingTestParameters,
            {
                name: editParamName,
                unit: editParamUnit,
                normal_range_min: editParamMin,
                normal_range_max: editParamMax,
                type: 'number' 
            }
        ])
        setEditParamName("")
        setEditParamUnit("")
        setEditParamMin("")
        setEditParamMax("")
    }

    const removeParameterFromEditTest = (index: number) => {
        setEditingTestParameters(editingTestParameters.filter((_, i) => i !== index))
    }

    const handleUpdateTestDefinition = async () => {
        if (!editingTestId || !editingTestName.trim() || !editingTestCategoryId) return
        try {
            setProcessing(true)
            await labService.updateTestDefinition(editingTestId, {
                name: editingTestName,
                parameters: editingTestParameters,
                category_id: editingTestCategoryId
            })
            setEditingTestId(null)
            await loadData()
        } catch (e) {
            alert("Failed to update test definition")
        } finally {
            setProcessing(false)
        }
    }

    const handleDeleteTestDefinition = async (id: number) => {
        if (!confirm("Are you sure you want to delete this test?")) return
        try {
            setProcessing(true)
            await labService.deleteTestDefinition(id)
            await loadData()
        } catch (e) {
            alert("Failed to delete test definition")
        } finally {
            setProcessing(false)
        }
    }

    const openEditTestModal = (test: TestDefinition, categoryId: number) => {
        setEditingTestId(test.id)
        setEditingTestName(test.name)
        setEditingTestParameters(test.parameters || [])
        setEditingTestCategoryId(categoryId)
    }

    if (loading && categories.length === 0) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400"/></div>

    return (
        <div className="max-w-5xl mx-auto space-y-6 pt-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Lab Test Management</h1>
            
            {/* Add New Category Form */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Beaker className="text-teal-600" size={20} />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Create New Laboratory Category</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Category Name</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            placeholder="e.g. Hematology"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                        />
                    </div>
                    <div>
                         <label className="text-xs font-medium text-slate-500 mb-1 block">Code (Optional)</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            placeholder="e.g. HEM"
                            value={newCategoryCode}
                            onChange={e => setNewCategoryCode(e.target.value)}
                        />
                    </div>
                    <div>
                         <label className="text-xs font-medium text-slate-500 mb-1 block">Lab Type</label>
                        <select 
                            className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            value={newLabType}
                            onChange={e => setNewLabType(e.target.value)}
                        >
                            <option value="pathology">Pathology</option>
                            <option value="radiology">Radiology</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                     <div className="col-span-1 md:col-span-4">
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Description (Optional)</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            placeholder="Brief description of the category..."
                            value={newCategoryDesc}
                            onChange={e => setNewCategoryDesc(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <button 
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim() || processing}
                        className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm transition-colors"
                    >
                        {processing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        Add Category
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 px-1">Categories & Tests</h3>
                {categories.length === 0 ? (
                     <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300">
                        <Beaker size={48} className="mb-4 opacity-20" />
                        <p>No test categories found.</p>
                        <p className="text-sm">Create one above to get started.</p>
                    </div>
                ) : (
                    categories.map(cat => (
                        <div key={cat.id} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm overflow-hidden transition-all duration-200">
                            {/* Category Header */}
                            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 flex-1">
                                    <button 
                                        onClick={() => setExpandedCategoryId(expandedCategoryId === cat.id ? null : cat.id)}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        {expandedCategoryId === cat.id ? 
                                            <ChevronDown size={20} className="text-slate-500"/> : 
                                            <ChevronRight size={20} className="text-slate-500"/>
                                        }
                                    </button>
                                    
                                    {editingId === cat.id ? (
                                        <div className="flex flex-col gap-2 flex-1 w-full animate-in fade-in slide-in-from-left-2">
                                            <div className="flex gap-2 items-center w-full flex-wrap">
                                                <input 
                                                    className="flex-1 min-w-[150px] p-1.5 border rounded text-sm bg-white dark:bg-slate-900"
                                                    value={editingName}
                                                    onChange={e => setEditingName(e.target.value)}
                                                    placeholder="Name"
                                                />
                                                <input 
                                                    className="w-24 p-1.5 border rounded text-sm bg-white dark:bg-slate-900"
                                                    value={editingCode}
                                                    onChange={e => setEditingCode(e.target.value)}
                                                    placeholder="Code"
                                                />
                                                <select 
                                                    className="p-1.5 border rounded text-sm bg-white dark:bg-slate-900"
                                                    value={editingLabType}
                                                    onChange={e => setEditingLabType(e.target.value as any)}
                                                >
                                                    <option value="pathology">Pathology</option>
                                                    <option value="radiology">Radiology</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <div className="flex gap-1">
                                                    <button onClick={handleUpdateCategory} disabled={processing} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"><Check size={16}/></button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"><X size={16}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                                            {cat.code && <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 font-mono border border-slate-300 dark:border-slate-700">{cat.code}</span>}
                                            <span className={`text-xs px-2.5 py-0.5 border rounded-full uppercase tracking-wide font-medium ${
                                                cat.lab_type === 'pathology' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                                cat.lab_type === 'radiology' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {cat.lab_type}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-1 pl-4 border-l border-slate-200 dark:border-slate-800 ml-4">
                                     <button onClick={() => { 
                                         setEditingId(cat.id); 
                                         setEditingName(cat.name);
                                         setEditingCode(cat.code || "");
                                         setEditingDesc(cat.description || "");
                                         setEditingLabType(cat.lab_type || "pathology");
                                     }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                        <Edit2 size={16}/>
                                     </button>
                                     <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 size={16}/>
                                     </button>
                                </div>
                            </div>

                            {/* Expanded Content (Tests) */}
                            {expandedCategoryId === cat.id && (
                                <div className="bg-slate-50 dark:bg-slate-900/20 p-6 border-t border-slate-200 dark:border-slate-800">
                                    
                                    {/* Existing Tests List */}
                                    {cat.TestDefinitions && cat.TestDefinitions.length > 0 && (
                                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {cat.TestDefinitions.map(test => (
                                                <div key={test.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative group">
                                                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            <TestTube size={16} className="text-teal-600"/>
                                                            <span className="font-semibold text-sm">{test.name}</span>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => openEditTestModal(test, cat.id)}
                                                                className="p-1 text-slate-400 hover:text-blue-600 rounded bg-slate-50 dark:bg-slate-800"
                                                            >
                                                                <Edit2 size={12}/>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteTestDefinition(test.id)}
                                                                className="p-1 text-slate-400 hover:text-red-600 rounded bg-slate-50 dark:bg-slate-800"
                                                            >
                                                                <Trash2 size={12}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {test.parameters?.map((param, idx) => (
                                                            <div key={idx} className="text-xs text-slate-500 flex justify-between">
                                                                <span>{param.name}</span>
                                                                <span className="font-mono text-slate-400">{param.normal_range_min}-{param.normal_range_max} {param.unit}</span>
                                                            </div>
                                                        ))}
                                                        {(!test.parameters || test.parameters.length === 0) && (
                                                            <p className="text-xs text-slate-400 italic">No parameters defined</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Edit Test Modal / Inline Form */}
                                    {editingTestId && editingTestCategoryId === cat.id && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-xl w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-bold">Edit Test Definition</h3>
                                                    <button onClick={() => setEditingTestId(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-medium mb-1 block">Test Name</label>
                                                        <input 
                                                            className="w-full p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-800"
                                                            value={editingTestName}
                                                            onChange={e => setEditingTestName(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded border p-3">
                                                        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Test Parameters</label>
                                                        
                                                        {editingTestParameters.length > 0 && (
                                                            <div className="space-y-2 mb-3">
                                                                {editingTestParameters.map((param, i) => (
                                                                    <div key={i} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 border p-2 rounded">
                                                                        <span className="font-medium flex-1">{param.name}</span>
                                                                        <span className="text-slate-500 text-xs px-2 bg-slate-100 dark:bg-slate-800 rounded">{param.unit}</span>
                                                                        <span className="text-slate-400 text-xs font-mono">{param.normal_range_min} - {param.normal_range_max}</span>
                                                                        <button onClick={() => removeParameterFromEditTest(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap gap-2 items-end">
                                                            <div className="flex-1 min-w-[120px]">
                                                                <input 
                                                                    className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                                    placeholder="Param Name"
                                                                    value={editParamName}
                                                                    onChange={e => setEditParamName(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="w-20">
                                                                <input 
                                                                    className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                                    placeholder="Unit"
                                                                    value={editParamUnit}
                                                                    onChange={e => setEditParamUnit(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="w-20">
                                                                <input 
                                                                    className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                                    placeholder="Min"
                                                                    value={editParamMin}
                                                                    onChange={e => setEditParamMin(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="w-20">
                                                                <input 
                                                                    className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                                    placeholder="Max"
                                                                    value={editParamMax}
                                                                    onChange={e => setEditParamMax(e.target.value)}
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={addParameterToEditTest}
                                                                className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300"
                                                                disabled={!editParamName.trim()}
                                                            >
                                                                <Plus size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 pt-2">
                                                        <button 
                                                            onClick={() => setEditingTestId(null)}
                                                            className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            onClick={handleUpdateTestDefinition}
                                                            disabled={!editingTestName.trim() || processing}
                                                            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                                                        >
                                                            {processing ? "Saving..." : "Save Changes"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Add New Test Section */}
                                    <div className="bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/30 rounded-lg p-4 shadow-sm">
                                        <h4 className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-3 flex items-center gap-2">
                                            <Plus size={16}/> Add New Test to {cat.name}
                                        </h4>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium mb-1 block">Test Name</label>
                                                <input 
                                                    className="w-full p-2 border rounded text-sm dark:bg-slate-950 dark:border-slate-800"
                                                    placeholder="Test Name (e.g. Complete Blood Count)"
                                                    value={newTestName}
                                                    onChange={e => setNewTestName(e.target.value)}
                                                />
                                            </div>
                                            
                                            {/* Parameters Builder */}
                                            <div className="bg-slate-50 dark:bg-slate-950/50 rounded border p-3">
                                                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Test Parameters</label>
                                                
                                                {/* List of pending parameters */}
                                                {newTestParameters.length > 0 && (
                                                    <div className="space-y-2 mb-3">
                                                        {newTestParameters.map((param, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 border p-2 rounded">
                                                                <span className="font-medium flex-1">{param.name}</span>
                                                                <span className="text-slate-500 text-xs px-2 bg-slate-100 dark:bg-slate-800 rounded">{param.unit}</span>
                                                                <span className="text-slate-400 text-xs font-mono">{param.normal_range_min} - {param.normal_range_max}</span>
                                                                <button onClick={() => removeParameterFromTest(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add Parameter Input Row */}
                                                <div className="flex flex-wrap gap-2 items-end">
                                                    <div className="flex-1 min-w-[120px]">
                                                        <input 
                                                            className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                            placeholder="Param Name (e.g. WBC)"
                                                            value={paramName}
                                                            onChange={e => setParamName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <input 
                                                            className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                            placeholder="Unit"
                                                            value={paramUnit}
                                                            onChange={e => setParamUnit(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <input 
                                                            className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                            placeholder="Min"
                                                            value={paramMin}
                                                            onChange={e => setParamMin(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <input 
                                                            className="w-full p-1.5 border rounded text-sm dark:bg-slate-900"
                                                            placeholder="Max"
                                                            value={paramMax}
                                                            onChange={e => setParamMax(e.target.value)}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={addParameterToTest}
                                                        className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300"
                                                        disabled={!paramName.trim()}
                                                    >
                                                        <Plus size={16}/>
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1">Add parameters like RBC, WBC, Hemoglobin etc.</p>
                                            </div>

                                            <div className="flex justify-end">
                                                <button 
                                                    onClick={() => handleAddTestDefinition(cat.id)}
                                                    disabled={!newTestName.trim() || processing}
                                                    className="px-4 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {processing ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
                                                    Save Test Definition
                                                </button>
                                            </div>
                                        </div>
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
